const Post = require("../models/Post");
const User = require("../models/User");
const { body, validationResult } = require('express-validator');

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("user", "fullName username avatar department followers") // include followers
      .populate("comments.user", "fullName username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const currentUserId = req.user && (req.user._id || req.user.userId);

    const postsWithIsFollowing = posts.map(post => {
      const userObj = post.user.toObject ? post.user.toObject() : post.user;
      userObj.isFollowing = userObj.followers && currentUserId
        ? userObj.followers.some(f => f.equals(currentUserId))
        : false;
      post.user = userObj;
      return post;
    });

    res.json({
      success: true,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      posts: postsWithIsFollowing,
      message: postsWithIsFollowing.length === 0 ? 'No posts found. Be the first to share something!' : ''
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Validation chain for post creation
exports.validatePost = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Post must be less than 5000 characters')
    .escape(),
];

// Create a new post
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { content, image, video } = req.body;
    const userId = req.user._id;

    // Create post with media
    const newPost = new Post({
      user: userId,
      content: content || '',
      image: image || null,
      video: video || null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id)
      .populate("user", "fullName username avatar department")
      .populate("comments.user", "fullName username avatar");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      success: false,
      message: "Server Error", 
      error: error.message 
    });
  }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'fullName username avatar');
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.userId;
    const likeIndex = post.likedBy.indexOf(userId);
    let liked = false;
    if (likeIndex === -1) {
      post.likedBy.push(userId);
      post.likes += 1;
      liked = true;
    } else {
      post.likedBy.splice(likeIndex, 1);
      post.likes -= 1;
    }

    await post.save();

    // Real-time notification logic
    if (liked && post.user._id.toString() !== userId.toString()) {
      // Only notify if not liking own post
      const Notification = require('../models/Notification');
      const notification = await Notification.create({
        user: post.user._id,
        type: 'like',
        message: `${req.user.fullName || 'Someone'} liked your post`,
        fromUser: userId,
        post: post._id
      });
      // Emit socket notification
      if (req.app.get('io')) {
        req.app.get('io').to(post.user._id.toString()).emit('notification', {
          type: 'like',
          message: notification.message,
          fromUser: userId,
          post: post._id,
          createdAt: notification.createdAt
        });
      }
    }

    res.json(post);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: userId,
      content
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("user", "fullName username avatar department")
      .populate("comments.user", "fullName username avatar");

    res.json(populatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.remove();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Report a post
exports.reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.userId;

    if (!reason) {
      return res.status(400).json({ message: "Report reason is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.reports.push({
      user: userId,
      reason
    });

    await post.save();
    res.json({ message: "Post reported successfully" });
  } catch (error) {
    console.error("Error reporting post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
