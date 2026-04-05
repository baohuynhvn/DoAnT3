const Course = require('../models/Course');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('createdBy', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('quizzes')

      .populate('flashcardDecks')

      .populate('createdBy', 'name');

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, quizzes, flashcardDecks } = req.body;

    const course = new Course({
      title,
      description,
      thumbnail,
      quizzes: quizzes || [],
      flashcardDecks: flashcardDecks || [],
      createdBy: req.user._id
    });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khoá học' });
    }

    const { title, description, thumbnail, quizzes, flashcardDecks } = req.body;

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (quizzes !== undefined) course.quizzes = quizzes;
    if (flashcardDecks !== undefined) course.flashcardDecks = flashcardDecks;

    const updated = await course.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khoá học' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá khoá học thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khoá học' });
    }

    if (course.studentsEnrolled.includes(req.user._id)) {
      return res.status(400).json({ message: 'Bạn đã tham gia khoá học này rồi' });
    }

    course.studentsEnrolled.push(req.user._id);

    await course.save();

    const populated = await Course.findById(course._id)
      .populate('quizzes')
      .populate('flashcardDecks')
      .populate('createdBy', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse };
