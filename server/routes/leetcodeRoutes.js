const express = require('express');
const router = express.Router();
const { connectLeetcode, getLeetcodeProfile, disconnectLeetcode } = require('../controllers/leetcodeController');
const { protect } = require('../middlewares/auth');

router.post('/connect', protect, connectLeetcode);
router.post('/disconnect', protect, disconnectLeetcode);
router.get('/profile', protect, getLeetcodeProfile);

module.exports = router;
