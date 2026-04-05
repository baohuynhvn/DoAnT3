const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: { type: String, default: '' },

  thumbnail: { type: String, default: '' },

  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],

  flashcardDecks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashcardDeck'
  }],

  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
