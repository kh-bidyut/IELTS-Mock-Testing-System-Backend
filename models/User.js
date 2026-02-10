const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePic: {
    type: String,
    default: ''
  },
  testAttempts: [
    {
      testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      sectionScores: {
        listening: { type: Number, min: 0, max: 100 },
        reading: { type: Number, min: 0, max: 100 },
        writing: { type: Number, min: 0, max: 100 },
        speaking: { type: Number, min: 0, max: 100 }
      },
      answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
        isCorrect: Boolean
      }],
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user statistics
userSchema.methods.getStats = function() {
  const attempts = this.testAttempts;
  if (attempts.length === 0) return null;

  const totalAttempts = attempts.length;
  const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
  
  // Calculate section-wise averages
  const sectionScores = {
    listening: [],
    reading: [],
    writing: [],
    speaking: []
  };

  attempts.forEach(attempt => {
    if (attempt.sectionScores) {
      Object.keys(sectionScores).forEach(section => {
        if (attempt.sectionScores[section] !== undefined) {
          sectionScores[section].push(attempt.sectionScores[section]);
        }
      });
    }
  });

  const sectionAverages = {};
  Object.keys(sectionScores).forEach(section => {
    if (sectionScores[section].length > 0) {
      sectionAverages[section] = sectionScores[section].reduce((a, b) => a + b, 0) / sectionScores[section].length;
    }
  });

  return {
    totalAttempts,
    averageScore: Math.round(averageScore),
    sectionAverages,
    recentAttempts: attempts.slice(-5).reverse()
  };
};

module.exports = mongoose.model('User', userSchema);