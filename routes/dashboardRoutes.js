const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboardStats, getRecommendations } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
