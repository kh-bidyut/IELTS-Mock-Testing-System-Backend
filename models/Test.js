const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  testNumber: {
    type: Number,
    required: true,
    min: 1
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
  title: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
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

// Compound index for book and test number
testSchema.index({ bookId: 1, testNumber: 1 }, { unique: true });

// Update updatedAt before saving
testSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get full test identifier
testSchema.virtual('fullIdentifier').get(function() {
  return `Test ${this.testNumber}`;
});

// Check if test includes specific module
testSchema.methods.hasModule = function(moduleName) {
  return this.modules.includes(moduleName.toLowerCase());
};

// Get module durations (approximate)
testSchema.methods.getModuleDurations = function() {
  const totalDuration = this.duration;
  const moduleCount = this.modules.length;
  
  // Standard IELTS durations
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

module.exports = mongoose.model('Test', testSchema);