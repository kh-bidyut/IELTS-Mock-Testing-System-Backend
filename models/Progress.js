const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  stats: {
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
  history: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    date: {
      type: Date,
      default: Date.now
    },
    bands: {
      overall: Number,
      listening: Number,
      reading: Number,
      writing: Number,
      speaking: Number
    }
  }],
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
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update progress stats based on new result
progressSchema.methods.updateStats = function(newResult) {
  const modules = ['listening', 'reading', 'writing', 'speaking'];
  
  modules.forEach(module => {
    if (newResult.bands[module]) {
      // Simple moving average - you might want more sophisticated tracking
      const currentAvg = this.stats[module] || 0;
      const newBand = newResult.bands[module];
      
      // Update average (you can adjust the weighting)
      this.stats[module] = (currentAvg + newBand) / 2;
    }
  });
  
  // Add to history
  this.history.push({
    testId: newResult.testId,
    date: new Date(),
    bands: {
      overall: newResult.bands.overall,
      listening: newResult.bands.listening,
      reading: newResult.bands.reading,
      writing: newResult.bands.writing,
      speaking: newResult.bands.speaking
    }
  });
  
  // Keep only last 20 entries
  if (this.history.length > 20) {
    this.history = this.history.slice(-20);
  }
};

module.exports = mongoose.model('Progress', progressSchema);