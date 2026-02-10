const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    trim: true
  },
  media: {
    type: String, // URL to audio/image file
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['audio', 'image', 'none'],
    default: 'none'
  }
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: ['Listening', 'Reading', 'Writing', 'Speaking']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  timeLimit: {
    type: Number, // in minutes
    default: 60
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update updatedAt before saving
testSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate maximum possible score
testSchema.virtual('maxScore').get(function() {
  return this.questions.length * 10; // Each question worth 10 points
});

// Get test statistics
testSchema.methods.getStats = function(attempts) {
  if (!attempts || attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0
    };
  }

  const scores = attempts.map(attempt => attempt.score);
  const totalAttempts = attempts.length;
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  return {
    totalAttempts,
    averageScore: Math.round(averageScore),
    highestScore,
    lowestScore
  };
};

module.exports = mongoose.model('Test', testSchema);