const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, runPlacementPrediction } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

router.get('/dashboard', protect, getDashboardAnalytics);
router.post('/placement/predict', protect, runPlacementPrediction);

module.exports = router;
