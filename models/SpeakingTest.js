const mongoose = require('mongoose');

const speakingTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
    unique: true
  },
  parts: [{
    part: {
      type: Number,
      required: true,
      enum: [1, 2, 3]
    },
    questions: [{
      type: String
    }],
    cue: {
      type: String
    },
    points: [{
      type: String
    }]
  }],
  totalTime: {
    type: Number, // in minutes
    default: 15
  },
  instructions: {
    type: String,
    default: 'You will have a face-to-face interview with an examiner. The test consists of three parts with different question types.'
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
speakingTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get part by number
speakingTestSchema.methods.getPart = function(partNumber) {
  return this.parts.find(part => part.part === partNumber);
};

// Get total questions count
speakingTestSchema.virtual('questionCount').get(function() {
  return this.parts.reduce((total, part) => total + (part.questions?.length || 0), 0);
});

module.exports = mongoose.model('SpeakingTest', speakingTestSchema);