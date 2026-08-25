const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    goal: { type: String, required: true }, // e.g. "Crack Google in 6 months", "Become a DevOps Engineer"
    durationDays: { type: Number, default: 90 },
    progress: { type: Number, default: 0 }, // 0 to 100
    milestones: [
      {
        title: { type: String, required: true },
        weekRange: { type: String }, // e.g. "Week 1-2"
        completed: { type: Boolean, default: false },
      }
    ],
    tasks: [
      {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        category: { type: String, default: 'DSA' }, // DSA, Project, System Design, DevOps, Resume, Mock Interview
        completed: { type: Boolean, default: false },
        resourceLink: { type: String, default: '' },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
