const mongoose = require('mongoose');

const passageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Passage title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Passage content is required'],
    trim: true
  },
  source: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Academic', 'General Training'],
    default: 'Academic'
  },
  readingLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'B2'
  },
  estimatedReadingTime: {
    type: Number, // in minutes
    default: 0
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    questionOrder: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update word count before saving
passageSchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).length;
    // Estimate reading time (average 200-250 words per minute)
    this.estimatedReadingTime = Math.ceil(this.wordCount / 225);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Passage', passageSchema);