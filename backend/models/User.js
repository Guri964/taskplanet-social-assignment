const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

// Hash password before saving - MODERN MONGOOSE WAY (Bina 'next' ke)
UserSchema.pre('save', async function () {
    // Agar password change nahi hua hai, toh aage badho
    if (!this.isModified('password')) {
        return;
    }
    
    // Password hash karo
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);