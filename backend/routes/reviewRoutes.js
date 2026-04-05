const express = require('express');
const router = express.Router();

const { getReviewsByTarget, createReview, getMyReviews } = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReview);

router.route('/mine').get(protect, getMyReviews);

router.route('/:targetId').get(getReviewsByTarget);

module.exports = router;
