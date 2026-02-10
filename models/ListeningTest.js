const mongoose = require('mongoose');

const listeningTestSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
    unique: true
  },
  time: {
    type: Number,
    default: 30 // minutes
  },
  sections: [{
    section: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4]
    },
    audio: {
      type: String,
      required: true
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }]
  }],
  totalQuestions: {
    type: Number,
    default: 40
  },
  instructions: {
    type: String,
    default: 'You will hear a number of different recordings and you will have to answer questions on what you hear. There will be time for you to read the questions and you will have time to check your work.'
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
listeningTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get section by number
listeningTestSchema.methods.getSection = function(sectionNumber) {
  return this.sections.find(section => section.section === sectionNumber);
};

// Get total questions count
listeningTestSchema.virtual('questionCount').get(function() {
  return this.sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
});

module.exports = mongoose.model('ListeningTest', listeningTestSchema);