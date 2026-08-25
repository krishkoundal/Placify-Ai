const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, default: '' },
    githubId: { type: String, default: '' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    college: { type: String, default: '' },
    branch: { type: String, default: '' },
    graduationYear: { type: Number, default: new Date().getFullYear() },
    cgpa: { type: Number, default: 0 },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    preferredLanguage: { type: String, default: 'JavaScript' },
    theme: { type: String, default: 'dark' },
    streak: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
