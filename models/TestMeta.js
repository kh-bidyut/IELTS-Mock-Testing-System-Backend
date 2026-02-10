const mongoose = require('mongoose');

// Test Metadata Collection Schema
const testSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  testNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['full_test', 'module_only', 'practice_set'],
    default: 'full_test'
  },
  modules: [{
    type: String,
    enum: ['listening', 'reading', 'writing', 'speaking']
  }],
  duration: {
    type: Number, // total duration in minutes
    default: 160
  },
  ieltsType: {
    type: String,
    enum: ['Academic', 'General'],
    default: 'Academic'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
testSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TestMeta', testSchema);