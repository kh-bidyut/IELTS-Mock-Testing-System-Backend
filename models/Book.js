const mongoose = require('mongoose');

// Books Collection Schema (Cambridge IELTS series)
const bookSchema = new mongoose.Schema({
  series: {
    type: String,
    required: true,
    enum: ['Cambridge IELTS', 'Official IELTS Practice Materials', 'Custom Series']
  },
  bookNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  testsCount: {
    type: Number,
    default: 4
  },
  year: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
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

// Update timestamps
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Book', bookSchema);