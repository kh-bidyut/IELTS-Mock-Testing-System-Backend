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
  },
  // IELTS-specific fields
  questionType: {
    type: String,
    enum: ['mcq', 'text', 'speaking', 'writing-task1', 'writing-task2', 'listening-mcq', 'reading-mcq'],
    default: 'mcq'
  },
  // For Writing Task 1 - Academic/General Training
  writingTaskType: {
    type: String,
    enum: ['academic-graph', 'academic-process', 'academic-map', 'general-letter'],
    default: null
  },
  // For Speaking test parts
  speakingPart: {
    type: Number,
    enum: [1, 2, 3],
    default: null
  },
  // Minimum word count requirement
  minWordCount: {
    type: Number,
    default: null
  },
  // Band score descriptors for writing/speaking
  bandDescriptors: {
    type: Map,
    of: String,
    default: {}
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
  // IELTS-specific fields
  ieltsTestType: {
    type: String,
    enum: ['Academic', 'General Training'],
    default: 'Academic'
  },
  // For Writing section - specify Task 1 or Task 2
  writingTask: {
    type: Number,
    enum: [1, 2],
    default: null
  },
  // For multi-part tests (Speaking, full IELTS)
  testParts: [{
    partNumber: Number,
    title: String,
    description: String,
    timeLimit: Number, // in minutes
    questions: [questionSchema]
  }],
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

// IELTS Band Score conversion (0-9 scale)
testSchema.methods.calculateBandScore = function(correctAnswers, totalQuestions) {
  if (totalQuestions === 0) return 0;
  
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  // IELTS band score conversion table
  if (percentage >= 90) return 9.0;
  if (percentage >= 80) return 8.0;
  if (percentage >= 70) return 7.0;
  if (percentage >= 60) return 6.0;
  if (percentage >= 50) return 5.0;
  if (percentage >= 40) return 4.0;
  if (percentage >= 30) return 3.0;
  if (percentage >= 20) return 2.0;
  if (percentage >= 10) return 1.0;
  return 0.0;
};

// Get detailed band score breakdown
testSchema.methods.getBandScoreDetails = function(correctAnswers, totalQuestions) {
  const bandScore = this.calculateBandScore(correctAnswers, totalQuestions);
  
  const descriptions = {
    9.0: 'Expert User - Has fully operational command of the language',
    8.0: 'Very Good User - Has fully operational command of the language with only occasional inaccuracies',
    7.0: 'Good User - Has operational command of the language, though with occasional inaccuracies',
    6.0: 'Competent User - Generally effective command of the language despite some inaccuracies',
    5.0: 'Modest User - Partial command of the language, coping with overall meaning in most situations',
    4.0: 'Limited User - Basic competence is limited to familiar situations',
    3.0: 'Extremely Limited User - Conveys and understands only general meaning in very familiar situations',
    2.0: 'Intermittent User - No real communication except for the most basic information',
    1.0: 'Non User - Can only say a few isolated words',
    0.0: 'Did not attempt the test'
  };
  
  return {
    bandScore,
    description: descriptions[bandScore] || 'Unknown level',
    percentage: Math.round((correctAnswers / totalQuestions) * 100)
  };
};

// Get test statistics
testSchema.methods.getStats = function(attempts) {
  if (!attempts || attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      averageBandScore: 0.0,
      highestScore: 0,
      lowestScore: 0,
      highestBandScore: 0.0,
      lowestBandScore: 0.0
    };
  }

  const scores = attempts.map(attempt => attempt.score);
  const bandScores = attempts.map(attempt => attempt.bandScore || 0);
  const totalAttempts = attempts.length;
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
  const averageBandScore = bandScores.reduce((sum, score) => sum + score, 0) / totalAttempts;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const highestBandScore = Math.max(...bandScores);
  const lowestBandScore = Math.min(...bandScores);

  return {
    totalAttempts,
    averageScore: Math.round(averageScore),
    averageBandScore: Math.round(averageBandScore * 2) / 2, // Round to nearest 0.5
    highestScore,
    lowestScore,
    highestBandScore: Math.round(highestBandScore * 2) / 2,
    lowestBandScore: Math.round(lowestBandScore * 2) / 2
  };
};

module.exports = mongoose.model('Test', testSchema);