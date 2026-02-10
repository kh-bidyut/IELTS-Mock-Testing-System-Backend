const Test = require('../models/Test');
const Book = require('../models/Book');
const ListeningTest = require('../models/ListeningTest');
const ReadingTest = require('../models/ReadingTest');
const WritingTest = require('../models/WritingTest');
const SpeakingTest = require('../models/SpeakingTest');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// @desc    Get all tests with advanced filtering and pagination
// @route   GET /api/v1/tests
// @access  Public
const getTests = async (req, res) => {
  try {
    const {
      bookId,
      testNumber,
      type,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    let query = { isActive: true };

    // Apply filters
    if (bookId) {
      query.bookId = bookId;
    }
    
    if (testNumber) {
      query.testNumber = parseInt(testNumber);
    }
    
    if (type) {
      query.type = type;
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
      .populate('bookId', 'series bookNumber year')
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

// @desc    Get single test with all module details
// @route   GET /api/v1/tests/:id
// @access  Public
const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('bookId', 'series bookNumber year');

    if (!test) {
      return errorResponse(res, 'Test not found', 404);
    }

    if (!test.isActive) {
      return errorResponse(res, 'Test is not available', 404);
    }

    // Get module-specific details
    const moduleData = {};
    
    if (test.modules.includes('listening')) {
      const listeningTest = await ListeningTest.findOne({ testId: test._id });
      if (listeningTest) moduleData.listening = listeningTest;
    }
    
    if (test.modules.includes('reading')) {
      const readingTest = await ReadingTest.findOne({ testId: test._id });
      if (readingTest) moduleData.reading = readingTest;
    }
    
    if (test.modules.includes('writing')) {
      const writingTest = await WritingTest.findOne({ testId: test._id });
      if (writingTest) moduleData.writing = writingTest;
    }
    
    if (test.modules.includes('speaking')) {
      const speakingTest = await SpeakingTest.findOne({ testId: test._id });
      if (speakingTest) moduleData.speaking = speakingTest;
    }

    return successResponse(res, { 
      test, 
      modules: moduleData 
    }, 'Test retrieved successfully');

  } catch (error) {
    console.error('Get test error:', error);
    return errorResponse(res, 'Server error fetching test', 500, error);
  }
};

// @desc    Create test with all modules
// @route   POST /api/v1/tests
// @access  Private/Admin
const createTest = async (req, res) => {
  try {
    const { 
      bookId, 
      testNumber, 
      type, 
      modules, 
      duration,
      title,
      description,
      ieltsType,
      difficulty,
      listeningData,
      readingData,
      writingData,
      speakingData
    } = req.body;

    // Validation
    if (!bookId || !testNumber || !modules || modules.length === 0) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    // Check if test already exists
    const existingTest = await Test.findOne({ bookId, testNumber });
    if (existingTest) {
      return errorResponse(res, 'Test already exists for this book and test number', 400);
    }

    // Create main test
    const test = await Test.create({
      bookId,
      testNumber,
      type,
      modules,
      duration,
      title,
      description,
      ieltsType,
      difficulty
    });

    // Create module-specific data
    if (modules.includes('listening') && listeningData) {
      await ListeningTest.create({
        testId: test._id,
        ...listeningData
      });
    }
    
    if (modules.includes('reading') && readingData) {
      await ReadingTest.create({
        testId: test._id,
        ...readingData
      });
    }
    
    if (modules.includes('writing') && writingData) {
      await WritingTest.create({
        testId: test._id,
        ...writingData
      });
    }
    
    if (modules.includes('speaking') && speakingData) {
      await SpeakingTest.create({
        testId: test._id,
        ...speakingData
      });
    }

    const populatedTest = await Test.findById(test._id)
      .populate('bookId', 'series bookNumber year');

    return successResponse(res, { test: populatedTest }, 'Test created successfully', 201);

  } catch (error) {
    console.error('Create test error:', error);
    return errorResponse(res, 'Server error creating test', 500, error);
  }
};

// @desc    Update test
// @route   PATCH /api/v1/tests/:id
// @access  Private/Admin
const updateTest = async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);

    if (!test) {
      return errorResponse(res, 'Test not found', 404);
    }

    // Check authorization (admin only for now)
    if (req.user && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this test', 403);
    }

    const updateFields = ['title', 'description', 'type', 'modules', 'duration', 'ieltsType', 'difficulty', 'isActive'];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        test[field] = req.body[field];
      }
    });

    const updatedTest = await test.save();
    const populatedTest = await Test.findById(updatedTest._id)
      .populate('bookId', 'series bookNumber year');

    return successResponse(res, { test: populatedTest }, 'Test updated successfully');

  } catch (error) {
    console.error('Update test error:', error);
    return errorResponse(res, 'Server error updating test', 500, error);
  }
};

// @desc    Delete test
// @route   DELETE /api/v1/tests/:id
// @access  Private/Admin
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return errorResponse(res, 'Test not found', 404);
    }

    // Check authorization
    if (req.user && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to delete this test', 403);
    }

    // Delete module-specific data
    await Promise.all([
      ListeningTest.deleteMany({ testId: test._id }),
      ReadingTest.deleteMany({ testId: test._id }),
      WritingTest.deleteMany({ testId: test._id }),
      SpeakingTest.deleteMany({ testId: test._id })
    ]);

    // Delete the main test
    await test.remove();

    return successResponse(res, {}, 'Test deleted successfully');

  } catch (error) {
    console.error('Delete test error:', error);
    return errorResponse(res, 'Server error deleting test', 500, error);
  }
};

// @desc    Submit test answers and calculate results
// @route   POST /api/v1/tests/:id/submit
// @access  Private
const submitTest = async (req, res) => {
  try {
    const { answers, timeTaken, usedAI = {} } = req.body;
    const testId = req.params.id;

    // Get test
    const test = await Test.findById(testId);
    if (!test) {
      return errorResponse(res, 'Test not found', 404);
    }

    if (!test.isActive) {
      return errorResponse(res, 'Test is not available', 400);
    }

    // Validate answers structure
    if (!answers) {
      return errorResponse(res, 'Please provide answers', 400);
    }

    // Calculate scores for each module
    const scores = {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0
    };

    const bands = {
      listening: 0.0,
      reading: 0.0,
      writing: 0.0,
      speaking: 0.0
    };

    // Process each module's answers
    for (const module of test.modules) {
      if (answers[module]) {
        // For now, simple scoring - would need more sophisticated logic
        scores[module] = Math.floor(Math.random() * 40); // Random score for demo
        bands[module] = parseFloat((Math.random() * 8 + 1).toFixed(1)); // Random band 1.0-9.0
      }
    }

    // Calculate overall band score
    const moduleBands = test.modules.map(module => bands[module]);
    const overallBand = moduleBands.reduce((sum, band) => sum + band, 0) / moduleBands.length;
    bands.overall = parseFloat(overallBand.toFixed(1));

    // Create result record
    const result = await Result.create({
      userId: req.user._id,
      testId: test._id,
      scores,
      bands,
      usedAI,
      timeTaken: timeTaken || 0
    });

    // Performance feedback
    let feedback = '';
    if (bands.overall >= 8.0) {
      feedback = 'Excellent performance! You have demonstrated expert level English proficiency.';
    } else if (bands.overall >= 7.0) {
      feedback = 'Very good performance! You have strong command of the language with only minor inaccuracies.';
    } else if (bands.overall >= 6.0) {
      feedback = 'Good performance! You have operational command of the language despite some inaccuracies.';
    } else if (bands.overall >= 5.0) {
      feedback = 'Competent level. You can cope with overall meaning in most situations but need improvement.';
    } else {
      feedback = 'Keep practicing. Review fundamental concepts and try again.';
    }

    return successResponse(res, {
      resultId: result._id,
      scores,
      bands,
      timeTaken: timeTaken || 0,
      feedback,
      usedAI
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