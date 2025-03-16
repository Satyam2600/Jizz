const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Create a Post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) return res.status(400).json({ message: "Post content is required" });

    const newPost = new Post({
      user: req.user.id,
      content,
      image,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 Get All Posts (Latest First)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "name profilePicture").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
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
    res.status(500).json({ message: "Server Error", error });
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
    res.status(500).json({ message: "Server Error", error });
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
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
