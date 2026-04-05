const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  isRemembered: { type: Boolean, default: false },
}, { _id: false });

const flashcardSchema = new mongoose.Schema({
  deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardDeck', required: true },

  front: { type: String, required: true },

  back: { type: String, required: true },

  userProgress: [userProgressSchema]
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
