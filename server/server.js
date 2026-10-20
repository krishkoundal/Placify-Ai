require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = async () => {
  const conn = require('./config/db');
  await conn();
};

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'https://placify-ai-8cfc.vercel.app',  // Production frontend
    'http://localhost:5173',                // Local dev
    'http://localhost:3000'                 // Local dev alt
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Register Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/leetcode', require('./routes/leetcodeRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/mentor', require('./routes/mentorRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Placify AI API Server' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express boundary error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
