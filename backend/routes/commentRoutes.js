const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');

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
router.post('/', authMiddleware, async (req, res) => {
    try {
        const comment = new Comment({
            content: req.body.content,
            post: req.body.postId,
            user: req.user.userId
        });
        const savedComment = await comment.save();
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('user', 'fullName username avatar');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a comment
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }
        comment.content = req.body.content;
        const updatedComment = await comment.save();
        const populatedComment = await Comment.findById(updatedComment._id)
            .populate('user', 'fullName username avatar');
        res.json(populatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a comment
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 