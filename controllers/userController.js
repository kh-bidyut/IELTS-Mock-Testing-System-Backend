const User = require('../models/User');
const Test = require('../models/Test');

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

    res.status(200).json({
      success: true,
      count: users.length,
      users,
      pagination
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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

    res.status(200).json({
      success: true,
      count: allAttempts.length,
      attempts: allAttempts
    });

  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user attempts',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        recentRegistrations,
        usersWithAttempts,
        totalAttempts: totalAttempts[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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

    res.status(200).json({
      success: true,
      count: user.testAttempts.length,
      attempts: user.testAttempts
    });

  } catch (error) {
    console.error('Get my attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your attempts',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = {
  getUsers,
  getUserAttempts,
  getUserStats,
  getMyAttempts
};