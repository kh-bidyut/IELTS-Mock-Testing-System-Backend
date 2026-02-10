const mongoose = require('mongoose');

// Writing Tests Collection Schema
const writingTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  timeLimit: {
    type: Number,
    default: 60 // minutes
  },
  tasks: [{
    taskNumber: {
      type: Number,
      required: true,
      enum: [1, 2]
    },
    taskType: {
      type: String,
      required: true,
      enum: ['academic_graph', 'academic_process', 'academic_map', 'general_letter', 'essay']
    },
    question: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    minWords: {
      type: Number,
      required: true
    },
    maxWords: {
      type: Number,
      default: null
    },
    bandDescriptors: {
      type: Map,
      of: String,
      default: {}
    }
  }],
  totalTasks: {
    type: Number,
    default: 2
  },
  ieltsType: {
    type: String,
    enum: ['Academic', 'General'],
    default: 'Academic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WritingTest', writingTestSchema);