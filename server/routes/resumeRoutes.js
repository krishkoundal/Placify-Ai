const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeUserResume, matchJobDescription, autoFixAndOptimizeResume } = require('../controllers/resumeController');
const { protect } = require('../middlewares/auth');

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/analyze', protect, upload.single('resume'), analyzeUserResume);
router.post('/match-job', protect, matchJobDescription);
router.post('/auto-fix', protect, upload.single('resume'), autoFixAndOptimizeResume);

module.exports = router;
