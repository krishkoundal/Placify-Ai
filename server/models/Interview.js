const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Technical', 'Coding', 'Behavioral', 'HR', 'Company Specific'], required: true },
    company: { type: String, default: 'General' },
    status: { type: String, enum: ['started', 'completed'], default: 'started' },
    questions: [
      {
        questionText: { type: String, required: true },
        userAnswer: { type: String, default: '' },
        aiFeedback: { type: String, default: '' },
        score: { type: Number, default: 0 },
        idealAnswer: { type: String, default: '' },
      }
    ],
    score: { type: Number, default: 0 }, // 0 to 100
    metrics: {
      technicalAccuracy: { type: Number, default: 0 }, // 0 to 10
      communication: { type: Number, default: 0 }, // 0 to 10
      confidence: { type: Number, default: 0 }, // 0 to 10
      grammar: { type: Number, default: 0 }, // 0 to 10
    },
    feedback: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      suggestions: [{ type: String }],
    },
    duration: { type: Number, default: 0 }, // in seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
