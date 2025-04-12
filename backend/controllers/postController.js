const Post = require("../models/Post");
const User = require("../models/User");

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name avatar department")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const newPost = new Post({
      user: userId,
      content,
      image: req.file ? req.file.path : null,
      video: req.file ? req.file.path : null
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id)
      .populate("user", "name avatar department")
      .populate("comments.user", "name avatar");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id;
    const likeIndex = post.likedBy.indexOf(userId);

    if (likeIndex === -1) {
      post.likedBy.push(userId);
      post.likes += 1;
    } else {
      post.likedBy.splice(likeIndex, 1);
      post.likes -= 1;
    }

    await post.save();
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
    const userId = req.user._id;

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
      .populate("user", "name avatar department")
      .populate("comments.user", "name avatar");

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

    if (post.user.toString() !== req.user._id.toString()) {
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
    const userId = req.user._id;

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
