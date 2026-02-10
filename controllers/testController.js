const Test = require('../models/Test');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// @desc    Get all tests with advanced filtering and pagination
// @route   GET /api/tests
// @access  Public
const getTests = async (req, res) => {
  try {
    const {
      section,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    let query = { isActive: true };

    // Apply filters
    if (section) {
      query.section = section;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const total = await Test.countDocuments(query);
    
    // Get tests with pagination
    const tests = await Test.find(query)
      .populate('createdBy', 'name')
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
      count: tests.length,
      tests,
      pagination
    }, 'Tests retrieved successfully');

  } catch (error) {
    console.error('Get tests error:', error);
    return errorResponse(res, 'Server error fetching tests', 500, error);
  }
};

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Public
const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (!test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Test is not available'
      });
    }

    return successResponse(res, { test }, 'Test retrieved successfully');

  } catch (error) {
    console.error('Get test error:', error);
    return errorResponse(res, 'Server error fetching test', 500, error);
  }
};

// @desc    Create test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = async (req, res) => {
  try {
    const { title, section, difficulty, description, timeLimit, questions } = req.body;

    // Validation
    if (!title || !section || !difficulty || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText || !question.correctAnswer) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is missing required fields`
        });
      }

      if (question.options && question.options.length > 0) {
        if (!question.options.includes(question.correctAnswer)) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Correct answer must be one of the options`
          });
        }
      }
    }

    const test = await Test.create({
      title,
      section,
      difficulty,
      description,
      timeLimit,
      questions,
      createdBy: req.user._id
    });

    const populatedTest = await Test.findById(test._id).populate('createdBy', 'name');

    return successResponse(res, { test: populatedTest }, 'Test created successfully', 201);

  } catch (error) {
    console.error('Create test error:', error);
    return errorResponse(res, 'Server error creating test', 500, error);
  }
};

// @desc    Update test
// @route   PATCH /api/tests/:id
// @access  Private/Admin
const updateTest = async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this test'
      });
    }

    const { title, section, difficulty, description, timeLimit, questions, isActive } = req.body;

    // Update fields if provided
    if (title !== undefined) test.title = title;
    if (section !== undefined) test.section = section;
    if (difficulty !== undefined) test.difficulty = difficulty;
    if (description !== undefined) test.description = description;
    if (timeLimit !== undefined) test.timeLimit = timeLimit;
    if (questions !== undefined) test.questions = questions;
    if (isActive !== undefined) test.isActive = isActive;

    const updatedTest = await test.save();
    const populatedTest = await Test.findById(updatedTest._id).populate('createdBy', 'name');

    return successResponse(res, { test: populatedTest }, 'Test updated successfully');

  } catch (error) {
    console.error('Update test error:', error);
    return errorResponse(res, 'Server error updating test', 500, error);
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Private/Admin
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this test'
      });
    }

    await test.remove();

    return successResponse(res, {}, 'Test deleted successfully');

  } catch (error) {
    console.error('Delete test error:', error);
    return errorResponse(res, 'Server error deleting test', 500, error);
  }
};

// @desc    Submit test answers with timer
// @route   POST /api/tests/:id/submit
// @access  Private
const submitTest = async (req, res) => {
  try {
    const { answers, timeTaken, startTime } = req.body;
    const testId = req.params.id;

    // Get test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (!test.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Test is not available'
      });
    }

    // Validate answers
    if (!answers || answers.length !== test.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Please answer all questions'
      });
    }

    // Calculate time taken if not provided
    let actualTimeTaken = timeTaken;
    if (!timeTaken && startTime) {
      actualTimeTaken = Math.floor((Date.now() - new Date(startTime)) / 1000); // in seconds
    }

    // Check if time limit exceeded (with 5 minute grace period)
    if (actualTimeTaken && test.timeLimit) {
      const timeLimitSeconds = test.timeLimit * 60;
      if (actualTimeTaken > (timeLimitSeconds + 300)) { // 5 minute grace period
        return res.status(400).json({
          success: false,
          message: 'Time limit exceeded for this test'
        });
      }
    }

    // Calculate score
    let correctAnswers = 0;
    let sectionScores = {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0
    };
    
    const answerDetails = [];
    const totalQuestions = test.questions.length;

    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer && userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      
      if (isCorrect) {
        correctAnswers++;
      }

      answerDetails.push({
        questionId: question._id,
        questionText: question.questionText,
        userAnswer: userAnswer || '',
        correctAnswer: question.correctAnswer,
        isCorrect,
        options: question.options
      });
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calculate section score (for future multi-section tests)
    const section = test.section.toLowerCase();
    sectionScores[section] = score;

    // Save attempt to user
    const user = await User.findById(req.user._id);
    user.testAttempts.push({
      testId,
      score,
      sectionScores,
      answers: answerDetails,
      timeTaken: actualTimeTaken,
      date: new Date()
    });

    await user.save();

    // Performance feedback
    let feedback = '';
    if (score >= 80) {
      feedback = 'Excellent performance! Keep up the great work.';
    } else if (score >= 60) {
      feedback = 'Good job! With more practice, you can achieve even better results.';
    } else if (score >= 40) {
      feedback = 'Fair attempt. Focus on improving your weaker areas.';
    } else {
      feedback = 'Keep practicing. Review the material and try again.';
    }

    return successResponse(res, {
      score,
      totalQuestions,
      correctAnswers,
      timeTaken: actualTimeTaken,
      feedback,
      answers: answerDetails,
      sectionScores
    }, 'Test submitted successfully');

  } catch (error) {
    console.error('Submit test error:', error);
    return errorResponse(res, 'Server error submitting test', 500, error);
  }
};

module.exports = {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  submitTest
};