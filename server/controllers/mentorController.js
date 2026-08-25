const Profile = require('../models/Profile');
const User = require('../models/User');
const aiService = require('../services/aiService');

// In-memory conversation state for simplicity (or can be stored in Mongoose models if required)
// For our production-ready SaaS setup, let's store conversations dynamically in a simple user session state.
const chatHistoryMap = {};

const askMentor = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const userId = req.user.id;
    if (!chatHistoryMap[userId]) {
      chatHistoryMap[userId] = [];
    }

    const profile = await Profile.findOne({ user: userId });
    
    // Call AI Mentor
    const chatHistory = chatHistoryMap[userId].slice(-10); // Keep last 10 turns
    const aiResponse = await aiService.mentorChat(message, chatHistory, profile || {});

    // Save history
    chatHistoryMap[userId].push({ role: 'user', content: message });
    chatHistoryMap[userId].push({ role: 'assistant', content: aiResponse.response });

    // Reward daily chat/learning XP
    const user = await User.findById(userId);
    if (user) {
      user.xp += 10;
      await user.save();
    }

    res.json({
      reply: aiResponse.response,
      history: chatHistoryMap[userId]
    });
  } catch (error) {
    console.error('AI Mentor chat error:', error.message);
    res.status(500).json({ message: 'Server error chatting with mentor' });
  }
};

const getMentorHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    res.json(chatHistoryMap[userId] || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  askMentor,
  getMentorHistory
};
