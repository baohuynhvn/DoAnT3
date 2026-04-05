const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },

  content: { type: String, required: true },

  options: [{ type: String, required: true }],

  correctAnswer: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
