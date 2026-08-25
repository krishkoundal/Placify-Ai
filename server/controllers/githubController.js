const Performance = require('../models/Performance');
const githubService = require('../services/githubService');

const connectGithub = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username is required' });
    }

    let performance = await Performance.findOne({ user: req.user.id });
    if (!performance) {
      performance = new Performance({ user: req.user.id });
    }

    const stats = await githubService.fetchGithubStats(username);
    performance.github = stats;
    await performance.save();

    // Also update User profile avatar if returned
    if (stats.avatarUrl) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { avatar: stats.avatarUrl });
    }

    res.json({
      message: 'GitHub connected successfully',
      github: performance.github
    });
  } catch (error) {
    console.error('Connect Github error:', error.message);
    res.status(500).json({ message: 'Server error connecting GitHub' });
  }
};

const getGithubProfile = async (req, res) => {
  try {
    const performance = await Performance.findOne({ user: req.user.id });
    if (!performance || !performance.github.connected) {
      return res.status(404).json({ message: 'GitHub not connected for this user' });
    }
    res.json(performance.github);
  } catch (error) {
    console.error('Get GitHub profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const disconnectGithub = async (req, res) => {
  try {
    let performance = await Performance.findOne({ user: req.user.id });
    if (performance) {
      performance.github = {
        connected: false,
        username: '',
        repositoriesCount: 0,
        starsCount: 0,
        commitsThisMonth: 0,
        followersCount: 0,
        bio: '',
        avatarUrl: '',
        commitHistory: [],
        topLanguages: [],
        topRepos: [],
        lastSynced: null
      };
      await performance.save();
    }
    // Also reset User profile avatar to initial badge
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user) {
      user.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=4f46e5`;
      await user.save();
    }
    res.json({ message: 'GitHub disconnected successfully' });
  } catch (error) {
    console.error('Disconnect GitHub error:', error.message);
    res.status(500).json({ message: 'Server error disconnecting GitHub' });
  }
};

module.exports = {
  connectGithub,
  getGithubProfile,
  disconnectGithub
};
