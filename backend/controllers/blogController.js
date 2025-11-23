const db = require('../db');

const blogController = {
  // Get all published blogs (public endpoint)
  getAllBlogs: async (req, res) => {
    try {
      const blogs = await db('blogs')
        .select('*')
        .orderBy('created_at', 'desc');
      
      res.json(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ message: 'Failed to fetch blogs' });
    }
  },

  // Get single blog by slug
  getBlogBySlug: async (req, res) => {
    try {
      const { identifier } = req.params;
      
      const blog = await db('blogs')
        .select('blogs.*')
        .where({ 'blogs.slug': identifier, 'blogs.status': 'published' })
        .first();

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Increment view count
      await db('blogs').where('id', blog.id).increment('views_count', 1);

      res.json(blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({ message: 'Failed to fetch blog' });
    }
  },

  // Get single blog by ID (check ownership for unpublished)
  getBlogById: async (req, res) => {
    try {
      const { identifier } = req.params;
      
      const blog = await db('blogs')
        .select('blogs.*')
        .where('blogs.id', identifier)
        .first();

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Only show published blogs to public, or own blogs to author/admin
      if (blog.status !== 'published') {
        if (!req.user || (req.user.id !== blog.author_id && req.user.role !== 'admin')) {
          return res.status(404).json({ message: 'Blog not found' });
        }
      }

      // Increment view count for published blogs
      if (blog.status === 'published') {
        await db('blogs').where('id', blog.id).increment('views_count', 1);
      }

      res.json(blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({ message: 'Failed to fetch blog' });
    }
  },

  // Get blog categories with counts
  getBlogCategories: async (req, res) => {
    try {
      const categories = await db('blogs')
        .select('category as name')
        .count('* as count')
        .where('status', 'published')
        .whereNotNull('category')
        .groupBy('category')
        .orderBy('count', 'desc');

      res.json(categories);
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      res.status(500).json({ message: 'Failed to fetch blog categories' });
    }
  },

  // Get top authors with post counts
  getTopAuthors: async (req, res) => {
    try {
      const authors = await db('users')
        .select(
          'users.id',
          'users.name',
          'users.email',
          'lawyers.profile_image'
        )
        .count('blogs.id as post_count')
        .innerJoin('blogs', 'users.id', 'blogs.author_id')
        .leftJoin('lawyers', 'users.email', 'lawyers.email')
        .where('blogs.status', 'published')
        .groupBy('users.id', 'users.name', 'users.email', 'lawyers.profile_image')
        .orderBy('post_count', 'desc')
        .limit(5);

      res.json(authors);
    } catch (error) {
      console.error('Error fetching top authors:', error);
      res.status(500).json({ message: 'Failed to fetch top authors' });
    }
  },

  // Get blog tags (simplified)
  getBlogTags: async (req, res) => {
    try {
      const blogs = await db('blogs')
        .select('tags')
        .where('status', 'published')
        .whereNotNull('tags');

      const tagCounts = {};
      blogs.forEach(blog => {
        if (blog.tags) {
          try {
            const tags = JSON.parse(blog.tags);
            if (Array.isArray(tags)) {
              tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });

      const tags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      res.json(tags);
    } catch (error) {
      console.error('Error fetching blog tags:', error);
      res.status(500).json({ message: 'Failed to fetch blog tags' });
    }
  },

  // Get popular posts by views
  getPopularPosts: async (req, res) => {
    try {
      const posts = await db('blogs')
        .select(
          'blogs.id',
          'blogs.title',
          'blogs.slug',
          'blogs.excerpt',
          'blogs.featured_image',
          'blogs.category',
          'blogs.views_count',
          'blogs.published_at',
          'blogs.author_name'
        )
        .where('blogs.status', 'published')
        .orderBy('blogs.views_count', 'desc')
        .limit(5);

      res.json(posts);
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      res.status(500).json({ message: 'Failed to fetch popular posts' });
    }
  },

  // Create new blog (lawyers only)
  createBlog: async (req, res) => {
    try {
      const { title, content, category, featured_image, author_name } = req.body;
      
      if (!title || !content || !category || !author_name) {
        return res.status(400).json({ message: 'Title, content, category, and author name are required' });
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const excerpt = content.substring(0, 200) + '...';
      
      const [blogId] = await db('blogs').insert({
        title,
        slug,
        content,
        excerpt,
        featured_image,
        category,
        author_name,
        status: 'published'
      });

      const newBlog = await db('blogs').where('id', blogId).first();
      res.status(201).json(newBlog);
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({ message: 'Failed to create blog' });
    }
  },

  // Update own blog (author only)
  updateBlog: async (req, res) => {
    try {
      const { identifier } = req.params;
      const { title, content, category, excerpt, featured_image, tags, status } = req.body;
      
      const updateData = {
        updated_at: new Date()
      };
      
      if (title) {
        updateData.title = title;
        updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (content) updateData.content = content;
      if (category) updateData.category = category;
      if (excerpt) updateData.excerpt = excerpt;
      if (featured_image) updateData.featured_image = featured_image;
      if (tags) updateData.tags = JSON.stringify(tags);
      if (status && ['draft', 'pending'].includes(status)) updateData.status = status;

      const updated = await db('blogs').where('id', identifier).update(updateData);
      
      if (!updated) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const updatedBlog = await db('blogs').where('id', identifier).first();
      res.json(updatedBlog);
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({ message: 'Failed to update blog' });
    }
  },

  // Delete own blog (author only)
  deleteBlog: async (req, res) => {
    try {
      const { identifier } = req.params;
      
      const deleted = await db('blogs').where('id', identifier).del();
      
      if (!deleted) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ message: 'Failed to delete blog' });
    }
  },

  // Get lawyer's own blogs (all statuses)
  getLawyerBlogs: async (req, res) => {
    try {
      const blogs = await db('blogs')
        .select('*')
        .orderBy('created_at', 'desc');
      
      res.json({ blogs });
    } catch (error) {
      console.error('Error fetching lawyer blogs:', error);
      res.status(500).json({ message: 'Failed to fetch blogs' });
    }
  }
};

module.exports = blogController;