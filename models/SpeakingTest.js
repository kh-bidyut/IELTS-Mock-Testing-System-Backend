const mongoose = require('mongoose');

// Speaking Tests Collection Schema
const speakingTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  parts: [{
    partNumber: {
      type: Number,
      required: true,
      enum: [1, 2, 3]
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    questions: [{
      type: String
    }],
    cueCard: {
      topic: {
        type: String
      },
      points: [{
        type: String
      }],
      preparationTime: {
        type: Number, // in seconds
        default: 60
      },
      speakingTime: {
        type: Number, // in seconds
        default: 120
      }
    },
    timeLimit: {
      type: Number // in minutes
    }
  }],
  totalParts: {
    type: Number,
    default: 3
  },
  totalTime: {
    type: Number, // in minutes
    default: 15
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SpeakingTest', speakingTestSchema);