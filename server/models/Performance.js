const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    github: {
      connected: { type: Boolean, default: false },
      username: { type: String, default: '' },
      repositoriesCount: { type: Number, default: 0 },
      starsCount: { type: Number, default: 0 },
      commitsThisMonth: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
      bio: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      commitHistory: [{ date: String, count: Number }],
      topLanguages: [{ language: String, percentage: Number }],
      topRepos: [{ name: String, stars: Number, language: String, url: String }],
      lastSynced: { type: Date },
    },
    leetcode: {
      connected: { type: Boolean, default: false },
      username: { type: String, default: '' },
      solved: {
        total: { type: Number, default: 0 },
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
      },
      ranking: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      contestRating: { type: Number, default: 0 },
      badges: [{ type: String }],
      lastSynced: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Performance', performanceSchema);
