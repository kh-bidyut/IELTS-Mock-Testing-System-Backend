const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    default: 'intermediate'
  },
  access: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  description: {
    type: String,
    trim: true,
    default: ''
  },
  duration: {
    type: Number, // total duration in minutes
    default: 160
  },
  modules: [{
    type: String,
    enum: ['listening', 'reading', 'writing', 'speaking']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
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

// Index for search and sorting
mockTestSchema.index({ level: 1, access: 1 });
mockTestSchema.index({ popularity: -1 });

// Update updatedAt before saving
mockTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get total number of tests
mockTestSchema.virtual('testCount').get(function() {
  return this.tests.length;
});

// Check if mock test includes specific module
mockTestSchema.methods.hasModule = function(moduleName) {
  return this.modules.includes(moduleName.toLowerCase());
};

// Get module durations
mockTestSchema.methods.getModuleDurations = function() {
  const totalDuration = this.duration;
  const moduleCount = this.modules.length;
  
  const standardDurations = {
    listening: 30,
    reading: 60,
    writing: 60,
    speaking: 15
  };
  
  const durations = {};
  this.modules.forEach(module => {
    durations[module] = standardDurations[module] || Math.floor(totalDuration / moduleCount);
  });
  
  return durations;
};

module.exports = mongoose.model('MockTest', mockTestSchema);