const express = require('express');
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  endInterview,
  getInterviewHistory,
  getInterviewReport
} = require('../controllers/interviewController');
const { protect } = require('../middlewares/auth');

router.post('/start', protect, startInterview);
router.post('/answer', protect, submitAnswer);
router.post('/end', protect, endInterview);
router.get('/history', protect, getInterviewHistory);
router.get('/report/:id', protect, getInterviewReport);

module.exports = router;
