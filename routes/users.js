const express = require('express');
const { 
  getUsers, 
  getUserAttempts, 
  getUserStats, 
  getMyAttempts 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.get('/', protect, admin, getUsers);
router.get('/attempts', protect, admin, getUserAttempts);
router.get('/stats', protect, admin, getUserStats);

// User routes
router.get('/my-attempts', protect, getMyAttempts);

module.exports = router;