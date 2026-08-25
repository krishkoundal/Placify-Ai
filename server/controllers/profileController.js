const Profile = require('../models/Profile');
const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', '-password');
    if (!profile) {
      profile = await Profile.create({ user: req.user.id });
      profile = await profile.populate('user', '-password');
    }
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      skills,
      projects,
      experience,
      education,
      achievements,
      certificates,
      socialLinks,
      profiles,
      targetCompanies,
      preferredRoles,
      college,
      branch,
      graduationYear,
      cgpa,
      phone,
      location,
      bio
    } = req.body;

    // Update User model fields
    const user = await User.findById(req.user.id);
    if (user) {
      if (college) user.college = college;
      if (branch) user.branch = branch;
      if (graduationYear) user.graduationYear = graduationYear;
      if (cgpa) user.cgpa = cgpa;
      if (phone) user.phone = phone;
      if (location) user.location = location;
      if (bio) user.bio = bio;
      await user.save();
    }

    // Update Profile model fields
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    if (skills) profile.skills = { ...profile.skills, ...skills };
    if (projects) profile.projects = projects;
    if (experience) profile.experience = experience;
    if (education) profile.education = education;
    if (achievements) profile.achievements = achievements;
    if (certificates) profile.certificates = certificates;
    if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
    if (profiles) profile.profiles = { ...profile.profiles, ...profiles };
    if (targetCompanies) profile.targetCompanies = targetCompanies;
    if (preferredRoles) profile.preferredRoles = preferredRoles;

    await profile.save();
    const updatedProfile = await Profile.findOne({ user: req.user.id }).populate('user', '-password');
    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let profile = await Profile.findOne({ user: userId }).populate('user', '-password');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const resumeScore = profile.resumeAnalysis ? profile.resumeAnalysis.score : 0;
    const githubScore = profile.socialLinks?.github ? 60 : 0;
    const leetcodeCount = profile.profiles?.leetcode ? 50 : 0;
    
    let careerScore = Math.round(
      (resumeScore * 0.2) +
      (githubScore * 0.15) +
      (Math.min(leetcodeCount / 300, 1) * 100 * 0.25) +
      (((profile.user?.cgpa || 0) / 10) * 100 * 0.1)
    );

    res.json({
      name: profile.user?.name || 'Developer',
      college: profile.user?.college || 'N/A',
      branch: profile.user?.branch || 'N/A',
      cgpa: profile.user?.cgpa || 0,
      skills: profile.skills || {},
      projects: profile.projects || [],
      leetcode: profile.profiles?.leetcode || '',
      github: profile.socialLinks?.github || '',
      targetCompanies: profile.targetCompanies || [],
      careerScore: Math.min(100, Math.max(0, careerScore))
    });
  } catch (error) {
    console.error('Get public profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile
};
