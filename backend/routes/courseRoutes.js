const express = require('express');
const router = express.Router();

const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse } = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getCourses).post(protect, createCourse);

router.route('/:id').get(getCourseById).put(protect, updateCourse).delete(protect, deleteCourse);

router.route('/:id/enroll').post(protect, enrollCourse);

module.exports = router;
