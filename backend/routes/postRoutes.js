const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware"); // For admin-only actions
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/assets/uploads/posts';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.fieldname === 'image') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
    } else if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only video files are allowed!'), false);
      }
    }
    cb(null, true);
  }
});

// 📌 Create a Post (With Mentions)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) return res.status(400).json({ message: "Post content is required" });

    // Extract mentioned usernames from content (@username)
    const mentionedUsernames = content.match(/@(\w+)/g) || [];
    const mentionedUsers = [];

    for (let username of mentionedUsernames) {
      const user = await User.findOne({ username: username.replace("@", "") }).select("_id");
      if (user) mentionedUsers.push(user._id);
    }

    const newPost = new Post({
      user: req.user.id,
      content,
      image,
      mentions: mentionedUsers, // Store mentioned users
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Get All Posts (Latest First)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePicture")
      .populate("mentions", "name username profilePicture") // Fetch mentioned users
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Get Posts by User ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    if (!posts.length) return res.status(404).json({ message: "No posts found" });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Like/Unlike a Post
router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
      await post.save();
      return res.status(200).json({ message: "Post unliked", likes: post.likes.length });
    } else {
      post.likes.push(req.user.id);
      await post.save();
      return res.status(200).json({ message: "Post liked", likes: post.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Delete a Post (Only Owner Can Delete)
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized to delete this post" });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Report a Post
router.post("/report/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!reason) return res.status(400).json({ message: "Report reason is required" });

    post.reports.push({ user: req.user.id, reason });
    await post.save();

    res.status(200).json({ message: "Post reported successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 📌 Get All Reported Posts (Admin Only)
router.get("/reports", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reportedPosts = await Post.find({ "reports.0": { $exists: true } })
      .populate("user", "name profilePicture")
      .populate("reports.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reportedPosts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Create a new post
router.post('/create', async (req, res) => {
  try {
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({ message: 'Content and user ID are required' });
    }

    // Validate if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = new Post({
      content,
      userId: new mongoose.Types.ObjectId(userId),
      likes: 0,
      comments: []
    });

    await post.save();

    // Return post with user information
    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'name avatar department')
      .lean();

    // Transform the response to match the frontend expectations
    const transformedPost = {
      ...populatedPost,
      user: {
        name: populatedPost.userId.name,
        avatar: populatedPost.userId.avatar,
        department: populatedPost.userId.department
      },
      userId: undefined
    };

    res.status(201).json(transformedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name avatar department')
      .sort({ createdAt: -1 })
      .lean();

    // Transform the response to match the frontend expectations
    const transformedPosts = posts.map(post => ({
      ...post,
      user: {
        name: post.userId.name,
        avatar: post.userId.avatar,
        department: post.userId.department
      },
      userId: undefined
    }));

    res.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Like a post
router.post('/:postId/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes += 1;
    await post.save();

    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

// Add a comment to a post
router.post('/:postId/comment', async (req, res) => {
  try {
    const { content, userId } = req.body;
    if (!content || !userId) {
      return res.status(400).json({ message: 'Content and user ID are required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const comment = {
      content,
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Return the new comment with user information
    const populatedPost = await Post.findById(post._id)
      .populate('comments.userId', 'name avatar')
      .lean();

    const newComment = populatedPost.comments[populatedPost.comments.length - 1];
    const transformedComment = {
      ...newComment,
      user: {
        name: newComment.userId.name,
        avatar: newComment.userId.avatar
      },
      userId: undefined
    };

    res.status(201).json(transformedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

module.exports = router;
