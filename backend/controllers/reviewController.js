const Review = require('../models/Review');

const getReviewsByTarget = async (req, res) => {
  try {
    const reviews = await Review.find({ targetId: req.params.targetId }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    const review = new Review({
      userId: req.user._id,
      targetType,
      targetId,
      rating,
      comment
    });

    const createdReview = await review.save();

    res.status(201).json(createdReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReviewsByTarget, getMyReviews, createReview };
