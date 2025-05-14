const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId).populate('user', 'fullName username avatar');
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      content,
      post: postId,
      user: userId
    });
    await newComment.save();
    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "username avatar fullName");

    // Notification logic for comment
    if (post.user._id.toString() !== userId.toString()) {
      const Notification = require('../models/Notification');
      const notification = await Notification.create({
        user: post.user._id,
        type: 'comment',
        message: `${req.user.fullName || 'Someone'} commented on your post: \"${content}\"`,
        fromUser: userId,
        post: post._id,
        isRead: false
      });
      // Emit socket notification
      if (req.app && req.app.get && req.app.get('io')) {
        req.app.get('io').to(post.user._id.toString()).emit('notification', {
          type: 'comment',
          message: notification.message,
          fromUser: userId,
          post: post._id,
          createdAt: notification.createdAt
        });
      }
    }

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate("user", "username avatar");

    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};