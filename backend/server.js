const express = require('express');

const dotenv = require('dotenv');

const cors = require('cors');

const mongoose = require('mongoose');

const path = require('path');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const authRoutes = require('./routes/authRoutes');

const quizRoutes = require('./routes/quizRoutes');

const flashcardRoutes = require('./routes/flashcardRoutes');

const userRoutes = require('./routes/userRoutes');

const courseRoutes = require('./routes/courseRoutes');

const attemptRoutes = require('./routes/attemptRoutes');

const reviewRoutes = require('./routes/reviewRoutes');

const achievementRoutes = require('./routes/achievementRoutes');

app.use('/api/auth', authRoutes);

app.use('/api/quizzes', quizRoutes);

app.use('/api/flashcards', flashcardRoutes);

app.use('/api/users', userRoutes);

app.use('/api/courses', courseRoutes);

app.use('/api/attempts', attemptRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/achievements', achievementRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
