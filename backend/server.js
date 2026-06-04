const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// 👉 REQUEST TRACKER: Koi bhi request aayegi toh terminal mein dikhega!
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] FRONTEND SE REQUEST AAYI: ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.log(err));

// 👉 PORT ko 5005 kar diya gaya hai taki koi conflict na ho
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));