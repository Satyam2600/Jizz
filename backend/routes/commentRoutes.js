const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const commentController = require('../controllers/commentController');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('user', 'fullName username avatar')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a comment
router.post('/', authenticate, commentController.addComment);

// Update a comment
router.patch('/:id', authenticate, commentController.updateComment);

// Delete a comment
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router; 