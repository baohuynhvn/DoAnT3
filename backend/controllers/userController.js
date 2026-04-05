const User = require('../models/User');

const QuizAttempt = require('../models/QuizAttempt');

const Review = require('../models/Review');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})

      .select('name exp level streak')

      .sort({ exp: -1 })

      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status === 'locked') {
      filter.isLocked = true;
    } else if (status === 'active') {
      filter.isLocked = { $ne: true };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleLockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Không thể khoá tài khoản Admin' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể khoá chính tài khoản của mình' });
    }

    user.isLocked = !user.isLocked;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isLocked: user.isLocked,
      exp: user.exp,
      level: user.level,
      streak: user.streak,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Không thể xoá tài khoản Admin' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể xoá chính tài khoản của mình' });
    }

    await QuizAttempt.deleteMany({ user: user._id });

    await Review.deleteMany({ user: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Đã xoá tài khoản và dữ liệu liên quan thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, getLeaderboard, getAllUsers, toggleLockUser, deleteUser };
