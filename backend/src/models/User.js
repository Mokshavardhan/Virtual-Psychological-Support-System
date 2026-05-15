
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String, // Store hash in production
        required: false // Optional for google auth users
    },
    name: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    picture: String,
    location: String,
    bio: String,
    role: {
        type: String,
        default: 'Member'
    },
    hobbies: [String],
    likes: [String],
    dislikes: [String],
    contact_name: String,
    contact_phone: String,
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
    coins: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

export const User = mongoose.model('User', userSchema);
