const mongoose = require('mongoose');

const flashcardDeckSchema = new mongoose.Schema({
  title: { type: String, required: true },

  description: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);
