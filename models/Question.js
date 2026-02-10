const mongoose = require('mongoose');

// Central Question Bank Schema
const questionSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true,
    enum: ['listening', 'reading', 'writing', 'speaking']
  },
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'short_answer', 'true_false', 'yes_no', 'gap_fill', 'essay', 'report', 'letter', 'discussion']
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  answer: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  marks: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'easy', 'medium', 'hard'],
    default: 'medium'
  },
  // For writing tasks
  minWords: {
    type: Number,
    default: null
  },
  taskType: {
    type: String,
    enum: ['academic_graph', 'academic_process', 'academic_map', 'general_letter', 'essay', 'academic-graph', 'academic-process', 'academic-map'],
    default: null
  },
  // For speaking parts
  speakingPart: {
    type: Number,
    enum: [1, 2, 3],
    default: null
  },
  preparationTime: {
    type: Number, // in seconds
    default: null
  },
  speakingTime: {
    type: Number, // in seconds
    default: null
  },
  cuePoints: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);