const express = require('express');
const { 
  getUserStats,
  getTestStats,
  getPlatformStats,
  getPerformanceTrend,
  getSectionPerformance,
  getRecentActivity
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// User analytics routes
router.get('/user-stats', protect, getUserStats);
router.get('/performance-trend', protect, getPerformanceTrend);
router.get('/section-performance', protect, getSectionPerformance);
router.get('/recent-activity', protect, getRecentActivity);

// Test analytics routes
router.get('/test-stats/:id', protect, getTestStats);

// Platform analytics routes (admin only)
router.get('/platform-stats', protect, admin, getPlatformStats);

module.exports = router;