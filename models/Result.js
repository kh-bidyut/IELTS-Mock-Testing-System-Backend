const mongoose = require('mongoose');

// Results Collection Schema
const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: {
    listening: {
      type: Map,
      of: String,
      default: {}
    },
    reading: {
      type: Map,
      of: String,
      default: {}
    },
    writing: {
      task1: {
        type: String,
        default: ''
      },
      task2: {
        type: String,
        default: ''
      }
    },
    speaking: {
      part1: [{
        question: String,
        answer: String
      }],
      part2: {
        response: String
      },
      part3: [{
        question: String,
        answer: String
      }]
    }
  },
  scores: {
    listening: {
      type: Number,
      default: 0
    },
    reading: {
      type: Number,
      default: 0
    },
    writing: {
      task1: {
        type: Number,
        default: 0
      },
      task2: {
        type: Number,
        default: 0
      }
    },
    speaking: {
      type: Number,
      default: 0
    }
  },
  bands: {
    listening: {
      type: Number,
      default: 0.0
    },
    reading: {
      type: Number,
      default: 0.0
    },
    writing: {
      type: Number,
      default: 0.0
    },
    speaking: {
      type: Number,
      default: 0.0
    },
    overall: {
      type: Number,
      default: 0.0
    }
  },
  timeTaken: {
    listening: {
      type: Number // in seconds
    },
    reading: {
      type: Number // in seconds
    },
    writing: {
      task1: Number, // in seconds
      task2: Number  // in seconds
    },
    speaking: {
      type: Number // in seconds
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);