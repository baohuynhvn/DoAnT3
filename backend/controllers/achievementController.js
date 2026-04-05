const Achievement = require('../models/Achievement');

const upload = require('../middleware/uploadMiddleware');

const fs = require('fs');

const path = require('path');

const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({});
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAchievement = async (req, res) => {
  const singleUpload = upload.single('icon');

  singleUpload(req, res, async function (err) {

    if (err) {
      return res.status(400).json({ message: 'Lỗi upload: ' + err.message });
    }

    try {
      const { name, description, condition, requiredKpi, kpiType } = req.body || {};

      if (!name || !description) {
        return res.status(400).json({ message: 'Thiếu tên hoặc mô tả huy hiệu' });
      }

      let iconUrl = (req.body && req.body.iconUrl) || '';

      if (req.file) {
        iconUrl = `/uploads/${req.file.filename}`;
      }

      const achievement = new Achievement({
        name,
        description,
        iconUrl,
        condition,
        requiredKpi: requiredKpi ? Number(requiredKpi) : 1,
        kpiType: kpiType || 'streak'
      });

      const created = await achievement.save();
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

const updateAchievement = async (req, res) => {
  const singleUpload = upload.single('icon');

  singleUpload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: 'Lỗi upload: ' + err.message });
    }

    try {
      const achievement = await Achievement.findById(req.params.id);
      if (!achievement) {
        return res.status(404).json({ message: 'Không tìm thấy huy hiệu' });
      }

      const { name, description, condition, requiredKpi, kpiType } = req.body || {};

      if (name) achievement.name = name;
      if (description) achievement.description = description;
      if (condition) achievement.condition = condition;
      if (requiredKpi) achievement.requiredKpi = Number(requiredKpi);
      if (kpiType) achievement.kpiType = kpiType;

      if (req.file) {
        if (achievement.iconUrl && achievement.iconUrl.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, '..', achievement.iconUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        achievement.iconUrl = `/uploads/${req.file.filename}`;
      }

      const updated = await achievement.save();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ message: 'Không tìm thấy huy hiệu' });
    }

    if (achievement.iconUrl && achievement.iconUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', achievement.iconUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá huy hiệu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkMyAchievements = async (req, res) => {
  try {
    const User = require('../models/User');

    const Course = require('../models/Course');

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    const allAchievements = await Achievement.find({});

    const newlyEarned = [];

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
        newlyEarned.push(ach.name);
      }
    }

    res.json({
      message: newlyEarned.length > 0
        ? `Chúc mừng! Bạn đã nhận được ${newlyEarned.length} danh hiệu mới: ${newlyEarned.join(', ')}`
        : 'Chưa có danh hiệu mới nào để nhận.',
      newlyEarned
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAchievements, createAchievement, updateAchievement, deleteAchievement, checkMyAchievements };
