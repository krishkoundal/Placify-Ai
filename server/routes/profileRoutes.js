const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getPublicProfile } = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');

router.get('/public/:userId', getPublicProfile);

router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
