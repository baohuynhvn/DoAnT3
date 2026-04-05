const express = require('express');
const router = express.Router();

const { getQuizzes, getQuizById, createQuiz, addQuestion, submitQuiz, deleteQuiz, updateQuiz, getQuestionsByQuiz, updateQuestion, deleteQuestion } = require('../controllers/quizController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getQuizzes).post(protect, createQuiz);

router.route('/:id').get(getQuizById).put(protect, updateQuiz).delete(protect, deleteQuiz);

router.route('/:id/questions').get(protect, getQuestionsByQuiz).post(protect, addQuestion);

router.route('/:id/submit').post(protect, submitQuiz);

router.route('/questions/:questionId').put(protect, updateQuestion).delete(protect, deleteQuestion);

module.exports = router;
