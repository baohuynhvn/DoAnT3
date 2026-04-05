const express = require('express');
const router = express.Router();

const { getMyAttempts, createAttempt } = require('../controllers/attemptController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyAttempts).post(protect, createAttempt);

module.exports = router;
