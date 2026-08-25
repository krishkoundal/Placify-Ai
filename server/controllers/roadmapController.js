const Roadmap = require('../models/Roadmap');
const Profile = require('../models/Profile');
const User = require('../models/User');
const aiService = require('../services/aiService');

const generateUserRoadmap = async (req, res) => {
  try {
    const { goal, durationDays } = req.body;
    if (!goal) {
      return res.status(400).json({ message: 'Roadmap goal is required' });
    }

    const days = parseInt(durationDays) || 30;
    const profile = await Profile.findOne({ user: req.user.id });

    const roadmapData = await aiService.generateRoadmap(goal, days, profile || {});

    // Delete existing roadmap
    await Roadmap.deleteOne({ user: req.user.id });

    const newRoadmap = await Roadmap.create({
      user: req.user.id,
      goal,
      durationDays: days,
      progress: 0,
      milestones: roadmapData.milestones,
      tasks: roadmapData.tasks
    });

    res.status(201).json(newRoadmap);
  } catch (error) {
    console.error('Generate roadmap error:', error.message);
    res.status(500).json({ message: 'Server error generating career roadmap' });
  }
};

const getRoadmap = async (req, res) => {
  try {
    let roadmap = await Roadmap.findOne({ user: req.user.id });
    if (!roadmap) {
      // Auto-generate a default starting roadmap so new users instantly have daily goals
      const defaultTasks = [
        { day: 1, title: 'Understand Big O Notation & Space Complexity', category: 'DSA', completed: false },
        { day: 1, title: 'Upload your Resume to parse ATS compatibility', category: 'Resume', completed: false },
        { day: 1, title: 'Setup GitHub Sync Connection in dashboard', category: 'GitHub', completed: false },
        { day: 1, title: 'Enter mock Technical Interview room', category: 'Interview', completed: false }
      ];
      
      roadmap = await Roadmap.create({
        user: req.user.id,
        goal: 'Become Placement Ready',
        durationDays: 30,
        progress: 0,
        milestones: [
          { title: 'Master Core DSA & Resume Audit', weekRange: 'Week 1', completed: false }
        ],
        tasks: defaultTasks
      });
    }
    res.json(roadmap);
  } catch (error) {
    console.error('getRoadmap error:', error.message);
    res.status(500).json({ message: 'Server error fetching roadmap' });
  }
};

const updateRoadmapTask = async (req, res) => {
  try {
    const { taskId, completed } = req.body;
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const roadmap = await Roadmap.findOne({ user: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const task = roadmap.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found in roadmap' });
    }

    const wasCompleted = task.completed;
    task.completed = !!completed;

    // Recalculate progress
    const completedCount = roadmap.tasks.filter(t => t.completed).length;
    roadmap.progress = Math.round((completedCount / roadmap.tasks.length) * 100);

    // Dynamic Milestone check
    // Simple mock heuristic: check task density to check off milestone
    if (roadmap.progress >= 25 && roadmap.milestones[0]) roadmap.milestones[0].completed = true;
    if (roadmap.progress >= 60 && roadmap.milestones[1]) roadmap.milestones[1].completed = true;
    if (roadmap.progress >= 95 && roadmap.milestones[2]) roadmap.milestones[2].completed = true;

    await roadmap.save();

    // Reward XP on complete
    if (task.completed && !wasCompleted) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.xp += 50; // 50 XP per completed daily goal
        if (user.xp >= user.level * 500) user.level += 1;
        await user.save();
      }
    }

    res.json({ roadmap, xpEarned: (task.completed && !wasCompleted) ? 50 : 0 });
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

module.exports = {
  generateUserRoadmap,
  getRoadmap,
  updateRoadmapTask
};
