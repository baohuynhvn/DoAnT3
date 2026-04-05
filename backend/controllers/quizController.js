const Quiz = require('../models/Quiz');

const Question = require('../models/Question');

const User = require('../models/User');

const Achievement = require('../models/Achievement');

const Course = require('../models/Course');

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).populate('createdBy', 'name');

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = await Question.find({ quizId: quiz._id }).select('-correctAnswer');

    res.json({ quiz, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createQuiz = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const quiz = new Quiz({
      title,
      description,
      category,
      createdBy: req.user._id,
    });

    const createdQuiz = await quiz.save();

    res.status(201).json(createdQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { content, options, correctAnswer } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      const question = new Question({
        quizId: quiz._id,
        content,
        options,
        correctAnswer,
      });
      const createdQuestion = await question.save();
      res.status(201).json(createdQuestion);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    let correctCount = 0;
    const results = [];

    for (let ans of answers) {
      const question = await Question.findById(ans.questionId);

      if (question) {
        const isCorrect = question.correctAnswer === ans.selectedOption;

        if (isCorrect) correctCount++;

        results.push({
          questionId: question._id,
          isCorrect,
          correctAnswer: question.correctAnswer
        });
      }
    }

    if (req.user) {
      const user = await User.findById(req.user._id);

      const earnedExp = correctCount * 10;

      user.exp += earnedExp;

      if (user.exp > user.level * 100) {
        user.level += 1;
      }

      user.streak += 1;

      await user.save();

      try {
        const allAchievements = await Achievement.find({});

        for (const ach of allAchievements) {

          const alreadyEarned = ach.earnedByUsers.some(
            e => e.userId.toString() === user._id.toString()
          );

          if (alreadyEarned) continue;

          let qualified = false;
          if (ach.kpiType === 'streak' && user.streak >= ach.requiredKpi) {
            qualified = true;
          } else if (ach.kpiType === 'exp' && user.exp >= ach.requiredKpi) {
            qualified = true;
          } else if (ach.kpiType === 'courses_completed') {
            const completedCourses = await Course.countDocuments({});
            if (completedCourses >= ach.requiredKpi) qualified = true;
          }

          if (qualified) {
            ach.earnedByUsers.push({ userId: user._id });
            await ach.save();
          }
        }
      } catch (achError) {
        console.error('Lỗi kiểm tra danh hiệu:', achError);
      }
    }

    res.json({
      score: correctCount,
      total: answers.length,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    await Question.deleteMany({ quizId: quiz._id });

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Đã xoá Quiz và toàn bộ câu hỏi thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { title, description, category } = req.body;

    if (title) quiz.title = title;

    if (description !== undefined) quiz.description = description;

    if (category) quiz.category = category;

    const updated = await quiz.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuizzes, getQuizById, createQuiz, addQuestion, submitQuiz, deleteQuiz, updateQuiz, getQuestionsByQuiz, updateQuestion, deleteQuestion };

async function getQuestionsByQuiz(req, res) {

  try {
    const questions = await Question.find({ quizId: req.params.id });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });

    const { content, options, correctAnswer } = req.body;
    if (content) question.content = content;
    if (options) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer;

    const updated = await question.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });

    await Question.findByIdAndDelete(req.params.questionId);

    res.json({ message: 'Đã xoá câu hỏi thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
