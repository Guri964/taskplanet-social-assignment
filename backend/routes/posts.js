const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Simple Middleware to mock Auth extraction (In real app, verify JWT here)
const authMiddleware = (req, res, next) => {
    // Assuming frontend sends userId and username in headers for simplicity of this task
    req.user = { 
        userId: req.header('userId'), 
        username: req.header('username') 
    };
    next();
};

// POST /api/posts - Create Post
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { text, image } = req.body;
        if (!text && !image) return res.status(400).json({ message: 'Text or Image is required' });

        const newPost = new Post({
            userId: req.user.userId,
            username: req.user.username,
            text,
            image
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/posts - Get Feed
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/posts/:id/like - Toggle Like
router.put('/:id/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const likeIndex = post.likes.findIndex(like => like.userId.toString() === req.user.userId);
        
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1); // Unlike
        } else {
            post.likes.push({ userId: req.user.userId, username: req.user.username }); // Like
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/posts/:id/comment - Add Comment
router.post('/:id/comment', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            userId: req.user.userId,
            username: req.user.username,
            text
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
