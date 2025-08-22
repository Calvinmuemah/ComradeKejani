const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

// Create a new post
router.post('/create', forumController.createPost);

// Get all posts
router.get('/getAll', forumController.getPosts);

// Get a single post
router.get('/:postId', forumController.getPostById);

// Reply to a post
router.post('/:postId/reply', forumController.replyToPost);

// Like/unlike a post
router.post('/:postId/like', forumController.toggleLike);

module.exports = router;

// Forum routes

// Create a new forum post
// POST /api/v1/forums/create
// Body: { title, category, content, author }
// Response: Newly created forum post object

// Get all forum posts
// GET /api/v1/forums/getAll
// Response: Array of forum posts with replies and likes

// Get a single forum post by ID
// GET /api/v1/forums/:postId
// Response: Forum post object with replies and likes

// Reply to a forum post
// POST /api/v1/forums/:postId/reply
// Body: { content, author }
// Response: Updated forum post object with the new reply

// Like or unlike a forum post
// POST /api/v1/forums/:postId/like
// Body: { userId }
// Response: Updated forum post object with likes array updated

