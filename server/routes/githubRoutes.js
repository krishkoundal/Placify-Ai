const express = require('express');
const router = express.Router();
const { connectGithub, getGithubProfile, disconnectGithub } = require('../controllers/githubController');
const { protect } = require('../middlewares/auth');

router.post('/connect', protect, connectGithub);
router.post('/disconnect', protect, disconnectGithub);
router.get('/profile', protect, getGithubProfile);

module.exports = router;
