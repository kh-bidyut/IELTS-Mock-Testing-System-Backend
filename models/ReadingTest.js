const mongoose = require('mongoose');

const readingTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
    unique: true
  },
  time: {
    type: Number,
    default: 60 // minutes
  },
  passages: [{
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    questions: [{
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
  instructions: {
    type: String,
    default: 'You will be given a number of texts to read and a number of questions to answer based on the information in the texts.'
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

// Update updatedAt before saving
readingTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get total questions count
readingTestSchema.virtual('questionCount').get(function() {
  return this.passages.reduce((total, passage) => total + (passage.questions?.length || 0), 0);
});

// Get passage by index
readingTestSchema.methods.getPassage = function(index) {
  return this.passages[index];
};

module.exports = mongoose.model('ReadingTest', readingTestSchema);