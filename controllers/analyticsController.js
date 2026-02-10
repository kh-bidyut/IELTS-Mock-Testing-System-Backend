const { calculateUserStats, calculateTestStats, getPlatformStats, getUserPerformanceTrend } = require('../utils/analytics');
const User = require('../models/User');
const Test = require('../models/Test');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Get user dashboard statistics
// @route   GET /api/analytics/user-stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const stats = await calculateUserStats(req.user._id);
    successResponse(res, { stats }, 'User statistics retrieved successfully');
  } catch (error) {
    console.error('Get user stats error:', error);
    errorResponse(res, 'Failed to retrieve user statistics', 500, error);
  }
};

// @desc    Get test statistics
// @route   GET /api/analytics/test-stats/:id
// @access  Private
const getTestStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await calculateTestStats(id);
    successResponse(res, { stats }, 'Test statistics retrieved successfully');
  } catch (error) {
    console.error('Get test stats error:', error);
    errorResponse(res, 'Failed to retrieve test statistics', 500, error);
  }
};

// @desc    Get platform statistics
// @route   GET /api/analytics/platform-stats
// @access  Private/Admin
const getPlatformStatsEndpoint = async (req, res) => {
  try {
    const stats = await getPlatformStats();
    successResponse(res, { stats }, 'Platform statistics retrieved successfully');
  } catch (error) {
    console.error('Get platform stats error:', error);
    errorResponse(res, 'Failed to retrieve platform statistics', 500, error);
  }
};

// @desc    Get user performance trend
// @route   GET /api/analytics/performance-trend
// @access  Private
const getPerformanceTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trend = await getUserPerformanceTrend(req.user._id, parseInt(days));
    successResponse(res, { trend }, 'Performance trend retrieved successfully');
  } catch (error) {
    console.error('Get performance trend error:', error);
    errorResponse(res, 'Failed to retrieve performance trend', 500, error);
  }
};

// @desc    Get section-wise performance
// @route   GET /api/analytics/section-performance
// @access  Private
const getSectionPerformance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || user.testAttempts.length === 0) {
      return successResponse(res, { 
        sectionPerformance: {
          listening: { average: 0, count: 0 },
          reading: { average: 0, count: 0 },
          writing: { average: 0, count: 0 },
          speaking: { average: 0, count: 0 }
        }
      });
    }

    const sectionData = {
      listening: { scores: [], count: 0 },
      reading: { scores: [], count: 0 },
      writing: { scores: [], count: 0 },
      speaking: { scores: [], count: 0 }
    };

    // Populate test data to get section information
    await User.populate(user, {
      path: 'testAttempts.testId',
      select: 'section'
    });

    user.testAttempts.forEach(attempt => {
      const test = attempt.testId;
      if (test && test.section) {
        const section = test.section.toLowerCase();
        if (sectionData[section]) {
          sectionData[section].scores.push(attempt.score);
          sectionData[section].count++;
        }
      }
    });

    const sectionPerformance = {};
    Object.keys(sectionData).forEach(section => {
      const data = sectionData[section];
      const average = data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0;
      
      sectionPerformance[section] = {
        average,
        count: data.count,
        highest: data.scores.length > 0 ? Math.max(...data.scores) : 0,
        lowest: data.scores.length > 0 ? Math.min(...data.scores) : 0
      };
    });

    successResponse(res, { sectionPerformance }, 'Section performance retrieved successfully');

  } catch (error) {
    console.error('Get section performance error:', error);
    errorResponse(res, 'Failed to retrieve section performance', 500, error);
  }
};

// @desc    Get recent activity
// @route   GET /api/analytics/recent-activity
// @access  Private
const getRecentActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('testAttempts.testId', 'title section difficulty')
      .select('testAttempts createdAt');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get recent 10 attempts
    const recentAttempts = user.testAttempts
      .slice(-10)
      .reverse()
      .map(attempt => ({
        testId: attempt.testId?._id,
        testTitle: attempt.testId?.title || 'Unknown Test',
        testSection: attempt.testId?.section || 'Unknown',
        score: attempt.score,
        date: attempt.date,
        timeAgo: getTimeAgo(attempt.date)
      }));

    // Get user registration info
    const registrationInfo = {
      joined: user.createdAt,
      timeAgo: getTimeAgo(user.createdAt)
    };

    successResponse(res, { 
      recentAttempts,
      registrationInfo,
      totalTests: user.testAttempts.length
    }, 'Recent activity retrieved successfully');

  } catch (error) {
    console.error('Get recent activity error:', error);
    errorResponse(res, 'Failed to retrieve recent activity', 500, error);
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
};

module.exports = {
  getUserStats,
  getTestStats,
  getPlatformStats: getPlatformStatsEndpoint,
  getPerformanceTrend,
  getSectionPerformance,
  getRecentActivity
};