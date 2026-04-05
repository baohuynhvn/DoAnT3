const QuizAttempt = require('../models/QuizAttempt');

const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id }).populate('quizId', 'title');
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAttempt = async (req, res) => {
  try {
    const { quizId, score, totalQuestions, timeSpent, answers } = req.body;

    const attempt = new QuizAttempt({
      userId: req.user._id,
      quizId,
      score,
      totalQuestions,
      timeSpent,
      answers
    });

    const createdAttempt = await attempt.save();

    res.status(201).json(createdAttempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyAttempts, createAttempt };
