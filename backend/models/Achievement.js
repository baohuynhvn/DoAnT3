const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  iconUrl: {
    type: String,
    default: '',
  },

  condition: {
    type: String,
    default: 'Hoàn thành nhiệm vụ bí mật'
  },

  requiredKpi: {
    type: Number,
    default: 1,
  },

  kpiType: {
    type: String,
    enum: ['streak', 'exp', 'courses_completed'],
    default: 'streak',
  },

  earnedByUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    earnedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
