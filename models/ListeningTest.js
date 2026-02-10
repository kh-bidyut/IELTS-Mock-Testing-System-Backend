const mongoose = require('mongoose');

// Listening Tests Collection Schema
const listeningTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  timeLimit: {
    type: Number,
    default: 30 // minutes
  },
  sections: [{
    sectionNumber: {
      type: Number,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    duration: {
      type: Number // in seconds
    },
    questionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }],
    canReplay: {
      type: Boolean,
      default: false
    }
  }],
  totalQuestions: {
    type: Number,
    default: 40
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

module.exports = mongoose.model('ListeningTest', listeningTestSchema);