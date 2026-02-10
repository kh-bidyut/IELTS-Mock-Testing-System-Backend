const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  weakAreas: [{
    type: String
  }],
  accuracy: {
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
    }
  },
  strengths: [{
    type: String
  }],
  improvementSuggestions: [{
    type: String
  }],
  lastAnalyzed: {
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

// Update updatedAt before saving
analyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Analyze performance based on results
analyticsSchema.methods.analyzePerformance = function(results) {
  const moduleAccuracies = {
    listening: [],
    reading: [],
    writing: [],
    speaking: []
  };

  // Calculate accuracies from recent results
  results.slice(-10).forEach(result => {
    if (result.scores && result.scores.listening !== undefined) {
      const maxScore = 40; // Assuming 40 questions
      const accuracy = result.scores.listening / maxScore;
      moduleAccuracies.listening.push(accuracy);
    }
    
    if (result.scores && result.scores.reading !== undefined) {
      const maxScore = 40; // Assuming 40 questions
      const accuracy = result.scores.reading / maxScore;
      moduleAccuracies.reading.push(accuracy);
    }
    
    // Writing and speaking would need different calculation methods
  });

  // Update accuracy averages
  Object.keys(moduleAccuracies).forEach(module => {
    if (moduleAccuracies[module].length > 0) {
      const avg = moduleAccuracies[module].reduce((a, b) => a + b, 0) / moduleAccuracies[module].length;
      this.accuracy[module] = Math.round(avg * 100) / 100;
    }
  });

  // Identify weak areas based on low accuracy
  this.weakAreas = [];
  Object.keys(this.accuracy).forEach(module => {
    if (this.accuracy[module] < 0.6) { // Below 60% accuracy
      this.weakAreas.push(`${module}_low_accuracy`);
    }
  });

  // Identify strengths
  this.strengths = [];
  Object.keys(this.accuracy).forEach(module => {
    if (this.accuracy[module] >= 0.8) { // 80%+ accuracy
      this.strengths.push(`${module}_strong_performance`);
    }
  });

  // Generate improvement suggestions
  this.improvementSuggestions = [];
  if (this.weakAreas.includes('listening_low_accuracy')) {
    this.improvementSuggestions.push('Practice listening to various accents and speeds');
  }
  if (this.weakAreas.includes('reading_low_accuracy')) {
    this.improvementSuggestions.push('Work on reading comprehension and vocabulary building');
  }
  if (this.weakAreas.includes('writing_low_accuracy')) {
    this.improvementSuggestions.push('Focus on essay structure and grammar practice');
  }
  if (this.weakAreas.includes('speaking_low_accuracy')) {
    this.improvementSuggestions.push('Practice speaking regularly and work on fluency');
  }

  this.lastAnalyzed = new Date();
};

module.exports = mongoose.model('Analytics', analyticsSchema);