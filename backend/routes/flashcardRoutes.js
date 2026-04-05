const express = require('express');
const router = express.Router();

const { getDecks, getDeckById, createDeck, addFlashcard, updateProgress, deleteDeck, deleteCard } = require('../controllers/flashcardController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getDecks).post(protect, createDeck);

router.route('/:id').get(getDeckById).delete(protect, deleteDeck);

router.route('/:deckId/cards').post(protect, addFlashcard);

router.route('/cards/:cardId/progress').put(protect, updateProgress);

router.route('/cards/:cardId').delete(protect, deleteCard);

module.exports = router;
