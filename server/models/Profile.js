const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: {
      technical: [{ type: String }],
      soft: [{ type: String }],
      missing: [{ type: String }],
    },
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String },
        techStack: [{ type: String }],
        githubUrl: { type: String, default: '' },
        liveUrl: { type: String, default: '' },
        qualityScore: { type: Number, default: 0 },
        aiFeedback: { type: String, default: '' },
      }
    ],
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        duration: { type: String },
        description: { type: String },
      }
    ],
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        year: { type: String },
        score: { type: String },
      }
    ],
    achievements: [{ type: String }],
    certificates: [{ type: String }],
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    profiles: {
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
    },
    targetCompanies: [{ type: String }],
    preferredRoles: [{ type: String }],
    resumeAnalysis: {
      score: { type: Number, default: 0 },
      atsScore: { type: Number, default: 0 },
      recruiterScore: { type: Number, default: 0 },
      suggestions: [{ type: String }],
      rawResumeText: { type: String, default: '' },
      lastUploaded: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
