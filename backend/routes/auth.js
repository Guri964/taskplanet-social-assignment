const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        console.log("---- SIGNUP REQUEST AAYI ----");
        console.log("Request Body:", req.body); // Frontend se data aaya ya nahi?

        const { username, email, password } = req.body;
        
        // 1. Validation
        if (!username || !email || !password) {
            console.log("Missing fields!");
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // 2. Check if user exists
        console.log("Checking if user exists...");
        let user = await User.findOne({ email });
        if (user) {
            console.log("User pehle se hai.");
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Create new user
        console.log("Naya user bana rahe hain...");
        user = new User({ username, email, password });
        
        console.log("User save kar rahe hain...");
        await user.save();
        console.log("User save ho gaya!");

        // 4. Generate Token
        console.log("Token bana rahe hain...");
        const token = jwt.sign(
            { userId: user._id, username: user.username }, 
            process.env.JWT_SECRET || 'fallback_secret', // Fallback in case env fails
            { expiresIn: '7d' }
        );
        
        console.log("Success! Bhej rahe hain.");
        res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("==== ASLI SIGNUP ERROR ====");
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user._id, username: user.username }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '7d' }
        );
        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;