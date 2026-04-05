const express = require('express');
const router = express.Router();

const { getUserProfile, getLeaderboard, getAllUsers, toggleLockUser, deleteUser } = require('../controllers/userController');

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getUserProfile);

router.route('/leaderboard').get(getLeaderboard);

router.route('/admin/all').get(protect, admin, getAllUsers);

router.route('/admin/:id/toggle-lock').put(protect, admin, toggleLockUser);

router.route('/admin/:id').delete(protect, admin, deleteUser);

module.exports = router;
