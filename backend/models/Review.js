const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  targetType: {
    type: String,
    enum: ['Quiz', 'FlashcardDeck', 'Course'],
    required: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  comment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
