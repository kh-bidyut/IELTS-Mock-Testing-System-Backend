// Validation utility functions

const { body, query, param, validationResult } = require('express-validator');

// Common validation rules
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email');

const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters');

const validateId = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

// Test validation rules
const validateTestTitle = body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ max: 100 })
  .withMessage('Title cannot exceed 100 characters');

const validateTestSection = body('section')
  .isIn(['Listening', 'Reading', 'Writing', 'Speaking'])
  .withMessage('Invalid section');

const validateTestDifficulty = body('difficulty')
  .isIn(['Beginner', 'Intermediate', 'Advanced'])
  .withMessage('Invalid difficulty level');

const validateQuestionsArray = body('questions')
  .isArray({ min: 1 })
  .withMessage('At least one question is required');

// Handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validate question structure
const validateQuestion = (question, index) => {
  const errors = [];
  
  if (!question.questionText || question.questionText.trim() === '') {
    errors.push(`Question ${index + 1}: Question text is required`);
  }
  
  if (!question.correctAnswer || question.correctAnswer.trim() === '') {
    errors.push(`Question ${index + 1}: Correct answer is required`);
  }
  
  if (question.options && question.options.length > 0) {
    if (!question.options.includes(question.correctAnswer)) {
      errors.push(`Question ${index + 1}: Correct answer must be one of the options`);
    }
  }
  
  return errors;
};

// Password strength validation
const isPasswordStrong = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateId,
  validateTestTitle,
  validateTestSection,
  validateTestDifficulty,
  validateQuestionsArray,
  handleValidationErrors,
  validateQuestion,
  isPasswordStrong
};