const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  series: {
    type: String,
    required: true,
    enum: ['Cambridge IELTS', 'Official IELTS Practice Materials', 'Custom Series'],
    default: 'Cambridge IELTS'
  },
  bookNumber: {
    type: Number,
    required: true,
    min: 1
  },
  testsCount: {
    type: Number,
    required: true,
    min: 1,
    default: 4
  },
  year: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
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

// Compound index for series and book number
bookSchema.index({ series: 1, bookNumber: 1 }, { unique: true });

// Update updatedAt before saving
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get full book title
bookSchema.virtual('fullTitle').get(function() {
  return `${this.series} ${this.bookNumber}`;
});

// Get book identifier
bookSchema.virtual('identifier').get(function() {
  return `${this.series.replace(' ', '')}${this.bookNumber}`;
});

module.exports = mongoose.model('Book', bookSchema);