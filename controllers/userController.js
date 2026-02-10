const User = require('../models/User');
const Test = require('../models/Test');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// @desc    Get all users with pagination (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    const pagination = {
      currentPage: pageNumber,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNumber,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null
    };

    return successResponse(res, {
      count: users.length,
      users,
      pagination
    }, 'Users retrieved successfully');

  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, 'Server error fetching users', 500, error);
  }
};

// @desc    Get user attempts (admin only)
// @route   GET /api/users/attempts
// @access  Private/Admin
const getUserAttempts = async (req, res) => {
  try {
    const { userId, testId } = req.query;

    let query = {};
    if (userId) query['_id'] = userId;
    if (testId) query['testAttempts.testId'] = testId;

    const users = await User.find(query)
      .select('name email role testAttempts createdAt')
      .populate('testAttempts.testId', 'title section')
      .sort({ createdAt: -1 });

    // Flatten attempts for easier viewing
    const allAttempts = [];
    users.forEach(user => {
      user.testAttempts.forEach(attempt => {
        allAttempts.push({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          testId: attempt.testId?._id,
          testTitle: attempt.testId?.title,
          testSection: attempt.testId?.section,
          score: attempt.score,
          date: attempt.date
        });
      });
    });

    return successResponse(res, {
      count: allAttempts.length,
      attempts: allAttempts
    }, 'User attempts retrieved successfully');

  } catch (error) {
    console.error('Get user attempts error:', error);
    return errorResponse(res, 'Server error fetching user attempts', 500, error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = totalUsers - adminUsers;

    // Get recent registrations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get test attempt statistics
    const usersWithAttempts = await User.countDocuments({
      'testAttempts.0': { $exists: true }
    });

    const totalAttempts = await User.aggregate([
      { $project: { attemptCount: { $size: '$testAttempts' } } },
      { $group: { _id: null, total: { $sum: '$attemptCount' } } }
    ]);

    return successResponse(res, {
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        recentRegistrations,
        usersWithAttempts,
        totalAttempts: totalAttempts[0]?.total || 0
      }
    }, 'User statistics retrieved successfully');

  } catch (error) {
    console.error('Get user stats error:', error);
    return errorResponse(res, 'Server error fetching user statistics', 500, error);
  }
};

// @desc    Get current user's attempts
// @route   GET /api/users/my-attempts
// @access  Private
const getMyAttempts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('testAttempts.testId', 'title section difficulty')
      .select('testAttempts');

    return successResponse(res, {
      count: user.testAttempts.length,
      attempts: user.testAttempts
    }, 'Your attempts retrieved successfully');

  } catch (error) {
    console.error('Get my attempts error:', error);
    return errorResponse(res, 'Server error fetching your attempts', 500, error);
  }
};

module.exports = {
  getUsers,
  getUserAttempts,
  getUserStats,
  getMyAttempts
};