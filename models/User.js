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
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  targetBand: {
    type: Number,
    min: 1,
    max: 9,
    default: 6
  },
  plan: {
    type: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  limits: {
    dailyMockTests: {
      type: Number,
      default: 1
    },
    aiWritingChecks: {
      type: Number,
      default: 0
    },
    aiSpeakingChecks: {
      type: Number,
      default: 0
    }
  },
  profilePic: {
    type: String,
    default: ''
  },
  profilePicPublicId: {
    type: String,
    default: ''
  },
  lastLogin: {
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

// Check if user has active premium plan
userSchema.methods.hasActivePlan = function() {
  if (this.plan.type === 'free') return false;
  if (!this.plan.expiresAt) return true; // Lifetime premium
  return this.plan.expiresAt > new Date();
};

// Get user's remaining daily limits
userSchema.methods.getRemainingLimits = function(dailyUsage) {
  return {
    mockTests: Math.max(0, this.limits.dailyMockTests - (dailyUsage?.mockTests || 0)),
    aiWriting: Math.max(0, this.limits.aiWritingChecks - (dailyUsage?.aiWriting || 0)),
    aiSpeaking: Math.max(0, this.limits.aiSpeakingChecks - (dailyUsage?.aiSpeaking || 0))
  };
};

module.exports = mongoose.model('User', userSchema);