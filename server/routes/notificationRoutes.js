const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(protect, getNotifications)
  .put(protect, markNotificationsAsRead);

module.exports = router;
