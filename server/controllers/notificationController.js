const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Seed initial welcome notifications if none exist
    if (notifications.length === 0) {
      const welcomeAlerts = [
        {
          user: req.user.id,
          title: 'Welcome to Placify OS 🎓',
          message: 'Initialize your digital developer identity by connecting profiles in GitHub & LeetCode tab.',
          type: 'info',
          priority: 'medium',
          read: false
        },
        {
          user: req.user.id,
          title: 'Resume ATS Audit Pending 📄',
          message: 'Upload your resume PDF to crawl keywords deficits and verify recruitment standards.',
          type: 'warning',
          priority: 'high',
          read: false
        }
      ];
      await Notification.insertMany(welcomeAlerts);
      notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    }

    res.json(notifications);
  } catch (error) {
    console.error('getNotifications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      // Mark specific notification as read
      await Notification.updateOne({ _id: id, user: req.user.id }, { read: true });
    } else {
      // Mark all as read
      await Notification.updateMany({ user: req.user.id }, { read: true });
    }
    const updated = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(updated);
  } catch (error) {
    console.error('markNotificationsAsRead error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead
};
