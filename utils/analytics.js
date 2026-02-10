// Analytics utility functions for performance tracking and statistics

const User = require('../models/User');
const Test = require('../models/Test');

// Calculate user performance statistics
const calculateUserStats = async (userId) => {
  try {
    const user = await User.findById(userId).populate('testAttempts.testId');
    
    if (!user || user.testAttempts.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        sectionAverages: {},
        performanceTrend: [],
        bestScore: 0,
        worstScore: 0
      };
    }

    const attempts = user.testAttempts;
    const totalTests = attempts.length;
    
    // Calculate overall statistics
    const scores = attempts.map(attempt => attempt.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalTests;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    
    // Calculate section-wise averages
    const sectionScores = {
      listening: [],
      reading: [],
      writing: [],
      speaking: []
    };
    
    attempts.forEach(attempt => {
      if (attempt.sectionScores) {
        Object.keys(sectionScores).forEach(section => {
          if (attempt.sectionScores[section] !== undefined) {
            sectionScores[section].push(attempt.sectionScores[section]);
          }
        });
      }
    });
    
    const sectionAverages = {};
    Object.keys(sectionScores).forEach(section => {
      if (sectionScores[section].length > 0) {
        const avg = sectionScores[section].reduce((a, b) => a + b, 0) / sectionScores[section].length;
        sectionAverages[section] = Math.round(avg);
      }
    });
    
    // Performance trend (last 10 attempts)
    const recentAttempts = attempts
      .slice(-10)
      .map(attempt => ({
        date: attempt.date,
        score: attempt.score,
        testTitle: attempt.testId?.title || 'Unknown Test'
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      totalTests,
      averageScore: Math.round(averageScore),
      sectionAverages,
      performanceTrend: recentAttempts,
      bestScore,
      worstScore
    };
    
  } catch (error) {
    throw new Error('Failed to calculate user statistics: ' + error.message);
  }
};

// Calculate test statistics
const calculateTestStats = async (testId) => {
  try {
    const users = await User.find({ 'testAttempts.testId': testId });
    
    if (users.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        completionRate: 0
      };
    }
    
    const allAttempts = [];
    users.forEach(user => {
      const attempts = user.testAttempts.filter(attempt => 
        attempt.testId.toString() === testId.toString()
      );
      allAttempts.push(...attempts);
    });
    
    const totalAttempts = allAttempts.length;
    const scores = allAttempts.map(attempt => attempt.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    return {
      totalAttempts,
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      completionRate: 100 // All attempts are completed
    };
    
  } catch (error) {
    throw new Error('Failed to calculate test statistics: ' + error.message);
  }
};

// Get platform-wide statistics
const getPlatformStats = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTests = await Test.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const recentTests = await Test.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate total test attempts
    const usersWithAttempts = await User.find({
      'testAttempts.0': { $exists: true }
    });
    
    const totalAttempts = usersWithAttempts.reduce((total, user) => {
      return total + user.testAttempts.length;
    }, 0);
    
    // Section-wise attempt distribution
    const sectionDistribution = {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0
    };
    
    usersWithAttempts.forEach(user => {
      user.testAttempts.forEach(attempt => {
        const test = attempt.testId;
        if (test && test.section) {
          const section = test.section.toLowerCase();
          if (sectionDistribution.hasOwnProperty(section)) {
            sectionDistribution[section]++;
          }
        }
      });
    });
    
    return {
      totalUsers,
      totalTests,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      recentUsers,
      recentTests,
      totalAttempts,
      sectionDistribution
    };
    
  } catch (error) {
    throw new Error('Failed to get platform statistics: ' + error.message);
  }
};

// Get user performance trends
const getUserPerformanceTrend = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const user = await User.findById(userId).populate('testAttempts.testId');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const filteredAttempts = user.testAttempts.filter(attempt => 
      new Date(attempt.date) >= startDate
    );
    
    // Group by date
    const dailyScores = {};
    filteredAttempts.forEach(attempt => {
      const date = new Date(attempt.date).toISOString().split('T')[0];
      if (!dailyScores[date]) {
        dailyScores[date] = [];
      }
      dailyScores[date].push(attempt.score);
    });
    
    // Calculate daily averages
    const trendData = Object.keys(dailyScores).map(date => ({
      date,
      averageScore: Math.round(
        dailyScores[date].reduce((sum, score) => sum + score, 0) / dailyScores[date].length
      ),
      attempts: dailyScores[date].length
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return trendData;
    
  } catch (error) {
    throw new Error('Failed to get performance trend: ' + error.message);
  }
};

module.exports = {
  calculateUserStats,
  calculateTestStats,
  getPlatformStats,
  getUserPerformanceTrend
};