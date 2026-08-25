const Performance = require('../models/Performance');
const leetcodeService = require('../services/leetcodeService');

const connectLeetcode = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'LeetCode username is required' });
    }

    let performance = await Performance.findOne({ user: req.user.id });
    if (!performance) {
      performance = new Performance({ user: req.user.id });
    }

    const stats = await leetcodeService.fetchLeetcodeStats(username);
    performance.leetcode = stats;
    await performance.save();

    res.json({
      message: 'LeetCode connected successfully',
      leetcode: performance.leetcode
    });
  } catch (error) {
    console.error('Connect LeetCode error:', error.message);
    res.status(500).json({ message: 'Server error connecting LeetCode' });
  }
};

const getLeetcodeProfile = async (req, res) => {
  try {
    const performance = await Performance.findOne({ user: req.user.id });
    if (!performance || !performance.leetcode.connected) {
      return res.status(404).json({ message: 'LeetCode not connected for this user' });
    }
    res.json(performance.leetcode);
  } catch (error) {
    console.error('Get LeetCode profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const disconnectLeetcode = async (req, res) => {
  try {
    let performance = await Performance.findOne({ user: req.user.id });
    if (performance) {
      performance.leetcode = {
        connected: false,
        username: '',
        solved: { total: 0, easy: 0, medium: 0, hard: 0 },
        ranking: 0,
        acceptanceRate: 0,
        contestRating: 0,
        badges: [],
        lastSynced: null
      };
      await performance.save();
    }
    res.json({ message: 'LeetCode disconnected successfully' });
  } catch (error) {
    console.error('Disconnect LeetCode error:', error.message);
    res.status(500).json({ message: 'Server error disconnecting LeetCode' });
  }
};

module.exports = {
  connectLeetcode,
  getLeetcodeProfile,
  disconnectLeetcode
};
