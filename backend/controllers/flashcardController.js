const FlashcardDeck = require('../models/FlashcardDeck');

const Flashcard = require('../models/Flashcard');

const getDecks = async (req, res) => {
  try {
    const decks = await FlashcardDeck.find({}).populate('createdBy', 'name');
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeckById = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findById(req.params.id);
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const cards = await Flashcard.find({ deckId: deck._id });

    res.json({ deck, cards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDeck = async (req, res) => {
  try {
    const { title, description } = req.body;
    const deck = new FlashcardDeck({ title, description, createdBy: req.user._id });
    const createdDeck = await deck.save();
    res.status(201).json(createdDeck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFlashcard = async (req, res) => {
  try {
    const { front, back } = req.body;

    const deck = await FlashcardDeck.findById(req.params.deckId);
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const flashcard = new Flashcard({ deckId: deck._id, front, back });
    const createdCard = await flashcard.save();
    res.status(201).json(createdCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { isRemembered } = req.body;

    const cardId = req.params.cardId;
    const card = await Flashcard.findById(cardId);

    if (!card) return res.status(404).json({ message: 'Flashcard not found' });

    let progress = card.userProgress.find(p => p.userId.toString() === req.user._id.toString());

    if (progress) {
      progress.isRemembered = isRemembered;
    } else {
      card.userProgress.push({ userId: req.user._id, isRemembered });
    }

    await card.save();

    res.json({ message: 'Progress updated', cardId, isRemembered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDeck = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findById(req.params.id);
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    await Flashcard.deleteMany({ deckId: deck._id });

    await FlashcardDeck.findByIdAndDelete(req.params.id);

    res.json({ message: 'Đã xoá Bộ thẻ và toàn bộ Flashcard thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCard = async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.cardId);
    res.json({ message: 'Đã xoá thẻ thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDecks, getDeckById, createDeck, addFlashcard, updateProgress, deleteDeck, deleteCard };
