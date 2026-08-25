const express = require('express');
const router = express.Router();
const { generateUserRoadmap, getRoadmap, updateRoadmapTask } = require('../controllers/roadmapController');
const { protect } = require('../middlewares/auth');

router.post('/generate', protect, generateUserRoadmap);
router.get('/', protect, getRoadmap);
router.put('/update', protect, updateRoadmapTask);

module.exports = router;
