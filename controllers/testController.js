const Test = require('../models/Test');
const User = require('../models/User');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
const getTests = async (req, res) => {
  try {
    const { section, difficulty, search } = req.query;
    
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

    const tests = await Test.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests
    });

  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tests',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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

    res.status(200).json({
      success: true,
      test
    });

  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching test',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      test: populatedTest
    });

  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating test',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      test: populatedTest
    });

  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating test',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully'
    });

  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting test',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Submit test answers
// @route   POST /api/tests/:id/submit
// @access  Private
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
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

    // Calculate score
    let correctAnswers = 0;
    const answerDetails = [];

    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      
      if (isCorrect) {
        correctAnswers++;
      }

      answerDetails.push({
        questionId: question._id,
        answer: userAnswer,
        isCorrect
      });
    });

    const score = Math.round((correctAnswers / test.questions.length) * 100);

    // Save attempt to user
    const user = await User.findById(req.user._id);
    user.testAttempts.push({
      testId,
      score,
      answers: answerDetails,
      date: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      score,
      totalQuestions: test.questions.length,
      correctAnswers,
      answers: answerDetails
    });

  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting test',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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