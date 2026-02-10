const express = require('express');
const { body } = require('express-validator');
const { 
  getTests, 
  getTest, 
  createTest, 
  updateTest, 
  deleteTest, 
  submitTest 
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createTestValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('section').isIn(['Listening', 'Reading', 'Writing', 'Speaking']).withMessage('Invalid section'),
  body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
];

const submitTestValidation = [
  body('answers').isArray().withMessage('Answers must be an array')
];

// Public routes
router.get('/', getTests);
router.get('/:id', getTest);

// Protected routes
router.post('/', protect, createTestValidation, createTest);
router.patch('/:id', protect, updateTest);
router.delete('/:id', protect, deleteTest);
router.post('/:id/submit', protect, submitTestValidation, submitTest);

module.exports = router;