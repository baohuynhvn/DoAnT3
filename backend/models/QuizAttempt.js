const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },

  score: {
    type: Number,
    required: true
  },

  totalQuestions: {
    type: Number,
    required: true
  },

  timeSpent: {
    type: Number,
    default: 0
  },

  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },

    selectedOption: String,

    isCorrect: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
