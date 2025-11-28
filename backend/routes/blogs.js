const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { requireAuth, requireLawyer, checkBlogOwnership } = require('../utils/middleware');

// LAWYER ROUTES (must be before dynamic routes)
// POST /api/blogs - Create new blog (lawyers only)
router.post('/', requireAuth, requireLawyer, blogController.createBlog);

// PUT /api/blogs/:id - Update own blog (author only)
router.put('/:identifier', requireAuth, requireLawyer, checkBlogOwnership, blogController.updateBlog);

// DELETE /api/blogs/:id - Delete own blog (author only)
router.delete('/:identifier', requireAuth, requireLawyer, checkBlogOwnership, blogController.deleteBlog);

// PUBLIC ROUTES (no auth required)
// GET /api/blogs - Get all published blogs
router.get('/', blogController.getAllBlogs);

// GET /api/blog-categories - Get blog categories (legacy endpoint)
router.get('/categories', blogController.getBlogCategories);

// GET /api/blogs/top-authors - Get top authors
router.get('/top-authors', blogController.getTopAuthors);

// GET /api/blogs/tags - Get blog tags
router.get('/tags', blogController.getBlogTags);

// GET /api/blogs/popular - Get popular posts
router.get('/popular', blogController.getPopularPosts);

// COMMENT ROUTES
// GET /api/blogs/:blog_id/comments - Get comments for a blog (public)
router.get('/:blog_id/comments', blogController.getBlogComments);

// POST /api/blogs/:blog_id/comments - Create comment (auth required)
router.post('/:blog_id/comments', requireAuth, blogController.createBlogComment);

// DELETE /api/blogs/comments/:comment_id - Delete own comment (auth required)
router.delete('/comments/:comment_id', requireAuth, blogController.deleteBlogComment);

// GET /api/blogs/:id - Get single blog (must be last)
router.get('/:identifier', (req, res) => {
  const { identifier } = req.params;
  if (/^\d+$/.test(identifier)) {
    blogController.getBlogById(req, res);
  } else {
    blogController.getBlogBySlug(req, res);
  }
});

module.exports = router;