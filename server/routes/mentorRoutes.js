const express = require('express');
const router = express.Router();
const { askMentor, getMentorHistory } = require('../controllers/mentorController');
const { protect } = require('../middlewares/auth');

router.post('/chat', protect, askMentor);
router.get('/history', protect, getMentorHistory);

module.exports = router;
