const mongoose = require('mongoose');

// Reading Tests Collection Schema
const readingTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  timeLimit: {
    type: Number,
    default: 60 // minutes
  },
  passages: [{
    passageNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    wordCount: {
      type: Number
    },
    estimatedReadingTime: {
      type: Number // in minutes
    },
    questionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }]
  }],
  totalQuestions: {
    type: Number,
    default: 40
  },
  ieltsType: {
    type: String,
    enum: ['Academic', 'General'],
    default: 'Academic'
  },
  bandScoreConversion: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ReadingTest', readingTestSchema);