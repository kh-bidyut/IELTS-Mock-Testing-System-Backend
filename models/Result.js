const mongoose = require('mongoose');

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
      type: Number,
      default: 0
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
  usedAI: {
    writing: {
      type: Boolean,
      default: false
    },
    speaking: {
      type: Boolean,
      default: false
    }
  },
  timeTaken: {
    type: Number // total time in seconds
  },
  submittedAt: {
    type: Date,
    default: Date.now
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

// Compound index for user and test
resultSchema.index({ userId: 1, testId: 1 }, { unique: true });

// Update updatedAt before saving
resultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate overall band score
resultSchema.virtual('overallBand').get(function() {
  const moduleBands = [this.bands.listening, this.bands.reading, this.bands.writing, this.bands.speaking];
  const sum = moduleBands.reduce((acc, band) => acc + band, 0);
  return Math.round((sum / 4) * 2) / 2; // Round to nearest 0.5
});

// Check if result includes AI assistance
resultSchema.virtual('hasAIUsage').get(function() {
  return this.usedAI.writing || this.usedAI.speaking;
});

module.exports = mongoose.model('Result', resultSchema);