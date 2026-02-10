const mongoose = require('mongoose');

const writingTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
    unique: true
  },
  time: {
    type: Number,
    default: 60 // minutes
  },
  tasks: [{
    task: {
      type: Number,
      required: true,
      enum: [1, 2]
    },
    type: {
      type: String,
      required: true,
      enum: ['academic_graph', 'academic_process', 'academic_map', 'general_letter', 'essay']
    },
    question: {
      type: String,
      required: true
    },
    minWords: {
      type: Number,
      required: true
    }
  }],
  ieltsType: {
    type: String,
    enum: ['Academic', 'General'],
    default: 'Academic'
  },
  instructions: {
    type: String,
    default: 'You will be given two tasks to complete. Task 1 requires you to write at least 150 words, and Task 2 requires at least 250 words.'
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
writingTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get task by number
writingTestSchema.methods.getTask = function(taskNumber) {
  return this.tasks.find(task => task.task === taskNumber);
};

// Get total word requirement
writingTestSchema.virtual('totalMinWords').get(function() {
  return this.tasks.reduce((total, task) => total + task.minWords, 0);
});

module.exports = mongoose.model('WritingTest', writingTestSchema);