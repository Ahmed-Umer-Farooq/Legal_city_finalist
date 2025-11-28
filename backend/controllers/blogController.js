const db = require('../db');

const blogController = {
  // Get all published blogs (public endpoint)
  getAllBlogs: async (req, res) => {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      const offset = (page - 1) * limit;

      let query = db('blogs')
        .select(
          'blogs.id',
          'blogs.title',
          'blogs.slug',
          'blogs.excerpt',
          'blogs.featured_image',
          'blogs.category',
          'blogs.views_count',
          'blogs.published_at',
          'blogs.author_name',
          'blogs.author_id',
          'blogs.content',
          'blogs.created_at'
        )
        .count('blog_comments.id as comment_count')
        .count('blog_likes.id as like_count')
        .leftJoin('blog_comments', 'blogs.id', 'blog_comments.blog_id')
        .leftJoin('blog_likes', 'blogs.id', 'blog_likes.blog_id')
        .groupBy('blogs.id');

      // Filter by status if specified, otherwise show all
      if (req.query.status) {
        query = query.where('blogs.status', req.query.status);
      }
      
      if (category) query = query.where('blogs.category', category);
      if (search) query = query.where('blogs.title', 'like', `%${search}%`);

      const blogs = await query.orderBy('blogs.created_at', 'desc').limit(limit).offset(offset);
      res.json({ data: blogs });
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
      const { title, content, category, excerpt, imageUrl, tags, author_name } = req.body;
      
      // Handle image - either uploaded file or URL or direct featured_image
      let featured_image = req.body.featured_image || '';
      if (req.file) {
        featured_image = `/uploads/${req.file.filename}`;
      } else if (imageUrl) {
        featured_image = imageUrl;
      }
      
      if (!title || !content || !category || !author_name) {
        return res.status(400).json({ message: 'Title, content, category, and author name are required' });
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const blogExcerpt = excerpt || content.substring(0, 200) + '...';
      
      const [blogId] = await db('blogs').insert({
        title,
        slug,
        content,
        excerpt: blogExcerpt,
        featured_image,
        category,
        author_name,
        author_id: req.user?.id || null,
        tags: tags ? JSON.stringify(tags) : null,
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
  },

  // Get comments for a blog (public)
  getBlogComments: async (req, res) => {
    try {
      const { blog_id } = req.params;
      
      const comments = await db('blog_comments')
        .select(
          'blog_comments.*',
          'users.name as user_name',
          'users.role as user_role'
        )
        .leftJoin('users', 'blog_comments.user_id', 'users.id')
        .where('blog_comments.blog_id', blog_id)
        .orderBy('blog_comments.created_at', 'asc');

      res.json(comments);
    } catch (error) {
      console.error('Error fetching blog comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  },

  // Create comment (auth required)
  createBlogComment: async (req, res) => {
    try {
      const { blog_id } = req.params;
      const { comment_text, parent_comment_id } = req.body;
      
      if (!comment_text || comment_text.trim().length === 0) {
        return res.status(400).json({ message: 'Comment text is required' });
      }

      // Check if blog exists
      const blog = await db('blogs').where('id', blog_id).first();
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const [commentId] = await db('blog_comments').insert({
        blog_id: parseInt(blog_id),
        user_id: req.user.id,
        comment_text: comment_text.trim(),
        parent_comment_id: parent_comment_id || null
      });

      const newComment = await db('blog_comments')
        .select(
          'blog_comments.*',
          'users.name as user_name',
          'users.role as user_role'
        )
        .leftJoin('users', 'blog_comments.user_id', 'users.id')
        .where('blog_comments.id', commentId)
        .first();

      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating blog comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  },

  // Delete own comment (auth required)
  deleteBlogComment: async (req, res) => {
    try {
      const { comment_id } = req.params;
      
      const comment = await db('blog_comments').where('id', comment_id).first();
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Only allow user to delete their own comment or admin
      if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only delete your own comments' });
      }

      await db('blog_comments').where('id', comment_id).del();
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog comment:', error);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  },

  // Like/Unlike blog (auth required)
  toggleBlogLike: async (req, res) => {
    try {
      const { blog_id } = req.params;
      const userId = req.user.id;

      // Check if user already liked this blog
      const existingLike = await db('blog_likes')
        .where({ blog_id: parseInt(blog_id), user_id: userId })
        .first();

      if (existingLike) {
        // Unlike
        await db('blog_likes').where({ blog_id: parseInt(blog_id), user_id: userId }).del();
        res.json({ liked: false, message: 'Blog unliked' });
      } else {
        // Like
        await db('blog_likes').insert({ blog_id: parseInt(blog_id), user_id: userId });
        res.json({ liked: true, message: 'Blog liked' });
      }
    } catch (error) {
      console.error('Error toggling blog like:', error);
      res.status(500).json({ message: 'Failed to toggle like' });
    }
  },

  // Save/Unsave blog (auth required)
  toggleBlogSave: async (req, res) => {
    try {
      const { blog_id } = req.params;
      const userId = req.user.id;

      // Check if user already saved this blog
      const existingSave = await db('blog_saves')
        .where({ blog_id: parseInt(blog_id), user_id: userId })
        .first();

      if (existingSave) {
        // Unsave
        await db('blog_saves').where({ blog_id: parseInt(blog_id), user_id: userId }).del();
        res.json({ saved: false, message: 'Blog removed from saved' });
      } else {
        // Save
        await db('blog_saves').insert({ blog_id: parseInt(blog_id), user_id: userId });
        res.json({ saved: true, message: 'Blog saved' });
      }
    } catch (error) {
      console.error('Error toggling blog save:', error);
      res.status(500).json({ message: 'Failed to toggle save' });
    }
  },

  // Get lawyer's blog analytics
  getLawyerBlogAnalytics: async (req, res) => {
    try {
      const lawyerId = req.user.id;
      
      // Get blogs with analytics
      const blogs = await db('blogs')
        .select(
          'blogs.id',
          'blogs.title',
          'blogs.featured_image',
          'blogs.status',
          'blogs.created_at',
          'blogs.views_count'
        )
        .count('blog_comments.id as comment_count')
        .count('blog_likes.id as like_count')
        .count('blog_saves.id as save_count')
        .leftJoin('blog_comments', 'blogs.id', 'blog_comments.blog_id')
        .leftJoin('blog_likes', 'blogs.id', 'blog_likes.blog_id')
        .leftJoin('blog_saves', 'blogs.id', 'blog_saves.blog_id')
        .where('blogs.author_id', lawyerId)
        .groupBy('blogs.id')
        .orderBy('blogs.created_at', 'desc');

      res.json({ success: true, data: blogs });
    } catch (error) {
      console.error('Error fetching blog analytics:', error);
      res.status(500).json({ message: 'Failed to fetch blog analytics' });
    }
  },

  // Get detailed analytics for a specific blog
  getBlogDetailedAnalytics: async (req, res) => {
    try {
      const { blog_id } = req.params;
      const lawyerId = req.user.id;
      
      // Verify blog ownership
      const blog = await db('blogs').where({ id: blog_id, author_id: lawyerId }).first();
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found or access denied' });
      }

      // Get engagement metrics
      const metrics = await db('blogs')
        .select(
          'blogs.id',
          'blogs.title',
          'blogs.views_count',
          'blogs.created_at'
        )
        .count('blog_comments.id as comment_count')
        .count('blog_likes.id as like_count')
        .count('blog_saves.id as save_count')
        .leftJoin('blog_comments', 'blogs.id', 'blog_comments.blog_id')
        .leftJoin('blog_likes', 'blogs.id', 'blog_likes.blog_id')
        .leftJoin('blog_saves', 'blogs.id', 'blog_saves.blog_id')
        .where('blogs.id', blog_id)
        .groupBy('blogs.id')
        .first();

      // Get comments with user details
      const comments = await db('blog_comments')
        .select(
          'blog_comments.*',
          'users.name as user_name',
          'users.role as user_role'
        )
        .leftJoin('users', 'blog_comments.user_id', 'users.id')
        .where('blog_comments.blog_id', blog_id)
        .orderBy('blog_comments.created_at', 'desc');

      // Get users who liked the blog
      const likes = await db('blog_likes')
        .select('users.name', 'users.id', 'blog_likes.created_at')
        .leftJoin('users', 'blog_likes.user_id', 'users.id')
        .where('blog_likes.blog_id', blog_id)
        .orderBy('blog_likes.created_at', 'desc');

      // Get users who saved the blog
      const saves = await db('blog_saves')
        .select('users.name', 'users.id', 'blog_saves.created_at')
        .leftJoin('users', 'blog_saves.user_id', 'users.id')
        .where('blog_saves.blog_id', blog_id)
        .orderBy('blog_saves.created_at', 'desc');

      res.json({
        success: true,
        data: {
          metrics,
          comments,
          likes,
          saves
        }
      });
    } catch (error) {
      console.error('Error fetching detailed blog analytics:', error);
      res.status(500).json({ message: 'Failed to fetch detailed analytics' });
    }
  },

  // Delete comment (blog author can delete any comment on their blog)
  deleteBlogCommentByAuthor: async (req, res) => {
    try {
      const { comment_id } = req.params;
      const lawyerId = req.user.id;
      
      // Get comment and verify blog ownership
      const comment = await db('blog_comments')
        .select('blog_comments.*', 'blogs.author_id')
        .leftJoin('blogs', 'blog_comments.blog_id', 'blogs.id')
        .where('blog_comments.id', comment_id)
        .first();

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Allow deletion if user is comment author, blog author, or admin
      if (comment.user_id !== lawyerId && comment.author_id !== lawyerId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      await db('blog_comments').where('id', comment_id).del();
      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  },

  // Get engagement count for notification badge
  getEngagementCount: async (req, res) => {
    try {
      const lawyerId = req.user.id;
      
      // Get total new engagements (comments, likes, saves) from last 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const [commentCount, likeCount, saveCount] = await Promise.all([
        db('blog_comments')
          .join('blogs', 'blog_comments.blog_id', 'blogs.id')
          .where('blogs.author_id', lawyerId)
          .where('blog_comments.created_at', '>', weekAgo)
          .count('* as count')
          .first(),
        db('blog_likes')
          .join('blogs', 'blog_likes.blog_id', 'blogs.id')
          .where('blogs.author_id', lawyerId)
          .where('blog_likes.created_at', '>', weekAgo)
          .count('* as count')
          .first(),
        db('blog_saves')
          .join('blogs', 'blog_saves.blog_id', 'blogs.id')
          .where('blogs.author_id', lawyerId)
          .where('blog_saves.created_at', '>', weekAgo)
          .count('* as count')
          .first()
      ]);

      const totalCount = (commentCount?.count || 0) + (likeCount?.count || 0) + (saveCount?.count || 0);
      
      res.json({ success: true, count: totalCount });
    } catch (error) {
      console.error('Error fetching engagement count:', error);
      res.status(500).json({ message: 'Failed to fetch engagement count' });
    }
  }
};

module.exports = blogController;