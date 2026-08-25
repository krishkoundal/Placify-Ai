const Profile = require('../models/Profile');
const Performance = require('../models/Performance');
const Interview = require('../models/Interview');
const aiService = require('../services/aiService');

const getDashboardAnalytics = async (req, res) => {
  try {
    const user = req.user;
    const profile = await Profile.findOne({ user: user.id });
    const performance = await Performance.findOne({ user: user.id });
    const interviews = await Interview.find({ user: user.id, status: 'completed' });

    // Aggregate statistics
    const resumeScore = profile && profile.resumeAnalysis && profile.resumeAnalysis.score ? profile.resumeAnalysis.score : 0;
    const leetcodeSolved = performance && performance.leetcode.connected ? performance.leetcode.solved.total : 0;
    const githubConnected = performance && performance.github.connected;
    const githubScore = githubConnected ? (performance.github.starsCount * 5 + 60) : 0;
    
    let interviewAvg = 0;
    if (interviews.length > 0) {
      const sum = interviews.reduce((acc, curr) => acc + curr.score, 0);
      interviewAvg = Math.round(sum / interviews.length);
    }

    // Predict placement metrics
    const prediction = await aiService.predictPlacementScore({
      resumeScore,
      githubScore,
      leetcodeSolved: performance && performance.leetcode.connected ? leetcodeSolved : 0,
      interviewAvg,
      cgpa: user.cgpa
    });

    // Structure charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const leetcodeGrowth = [];
    
    if (performance && performance.leetcode.connected) {
      // Generate detailed 12-month growth curve ending at current solved problems count
      for (let i = 11; i >= 0; i--) {
        const idx = (currentMonthIdx - i + 12) % 12;
        const monthName = months[idx];
        const solvedVal = Math.max(0, Math.round(leetcodeSolved - (i * (leetcodeSolved * 0.08))));
        leetcodeGrowth.push({ month: monthName, solved: solvedVal });
      }
    }

    const githubActivity = performance && performance.github.connected && performance.github.commitHistory
      ? performance.github.commitHistory.map(c => {
          const dateObj = new Date(c.date);
          const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          return { day: formattedDate, commits: c.count };
        })
      : [];

    const interviewTrends = interviews.length > 0 
      ? interviews.map((item, idx) => ({ round: `Round ${idx + 1}`, score: item.score }))
      : [];

    res.json({
      summary: {
        careerScore: prediction.careerScore,
        atsScore: profile && profile.resumeAnalysis ? profile.resumeAnalysis.atsScore : 0,
        expectedSalary: prediction.expectedSalary,
        leetcodeSolved,
        leetcodeBreakdown: performance ? performance.leetcode.solved : { total: 0, easy: 0, medium: 0, hard: 0 },
        githubCommitsThisMonth: performance ? performance.github.commitsThisMonth : 0,
        streak: user.streak,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar,
        targetCompanies: profile ? profile.targetCompanies : []
      },
      predictions: prediction,
      charts: {
        leetcodeGrowth,
        githubActivity,
        interviewTrends
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error.message);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

const runPlacementPrediction = async (req, res) => {
  try {
    const user = req.user;
    const profile = await Profile.findOne({ user: user.id });
    const performance = await Performance.findOne({ user: user.id });
    const interviews = await Interview.find({ user: user.id, status: 'completed' });

    const resumeScore = profile && profile.resumeAnalysis && profile.resumeAnalysis.score ? profile.resumeAnalysis.score : 0;
    const leetcodeSolved = performance && performance.leetcode.connected ? performance.leetcode.solved.total : 0;
    const githubConnected = performance && performance.github.connected;
    const githubScore = githubConnected ? (performance.github.starsCount * 5 + 60) : 0;
    
    let interviewAvg = 0;
    if (interviews.length > 0) {
      const sum = interviews.reduce((acc, curr) => acc + curr.score, 0);
      interviewAvg = Math.round(sum / interviews.length);
    }

    const prediction = await aiService.predictPlacementScore({
      resumeScore,
      githubScore,
      leetcodeSolved: performance && performance.leetcode.connected ? leetcodeSolved : 0,
      interviewAvg,
      cgpa: user.cgpa
    });

    res.json(prediction);
  } catch (error) {
    console.error('Run prediction error:', error.message);
    res.status(500).json({ message: 'Server error runs prediction' });
  }
};

module.exports = {
  getDashboardAnalytics,
  runPlacementPrediction
};
