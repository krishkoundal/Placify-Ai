const Interview = require('../models/Interview');
const User = require('../models/User');
const aiService = require('../services/aiService');

const startInterview = async (req, res) => {
  try {
    const { type, company } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'Interview type is required' });
    }

    // Get the first adaptive question from AI
    const firstQA = await aiService.getNextInterviewQuestion(type, company || 'General', [], 'Easy');

    const interview = await Interview.create({
      user: req.user.id,
      type,
      company: company || 'General',
      status: 'started',
      questions: [
        {
          questionText: firstQA.question,
          idealAnswer: firstQA.idealAnswer,
          userAnswer: '',
          aiFeedback: ''
        }
      ]
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Start interview error:', error.message);
    res.status(500).json({ message: 'Server error starting interview' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;

    if (!interviewId || answer === undefined) {
      return res.status(400).json({ message: 'Please provide interview ID and answer text' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Save answer to the current active question (the last one in the array)
    const currentQuestionIndex = interview.questions.length - 1;
    const currentQuestion = interview.questions[currentQuestionIndex];
    currentQuestion.userAnswer = answer;

    // Fast local evaluation of the individual answer to adapt difficulty
    const cleanText = answer.replace(/\/\/.*/g, '').replace(/Code \([a-z]+\):/gi, '').replace(/Notes:/gi, '').trim();
    const answerWords = cleanText.length > 0 ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    
    let localScore = 0;
    if (answerWords === 0) {
      localScore = 0;
      currentQuestion.aiFeedback = 'Question skipped or left blank (0 points).';
    } else {
      if (answerWords > 5) localScore += 3;
      if (answerWords > 25) localScore += 3;
      if (cleanText.toLowerCase().includes('database') || cleanText.toLowerCase().includes('index') || cleanText.toLowerCase().includes('security') || cleanText.toLowerCase().includes('complexity') || cleanText.toLowerCase().includes('map')) {
        localScore += 4;
      }
      currentQuestion.aiFeedback = localScore >= 7 ? 'Excellent detail and keyword usage.' : 'Good attempt, but could benefit from deeper technical detail.';
    }
    currentQuestion.score = Math.min(10, localScore);

    // Check if we reached 4 questions (Standard session duration)
    if (interview.questions.length >= 4) {
      // Return flag indicating interview is complete and ready to call endInterview
      await interview.save();
      return res.json({
        interview,
        isCompleted: true,
        nextQuestion: null
      });
    }

    // Else generate next adaptive question
    const history = interview.questions.map(q => ({
      question: q.questionText,
      answer: q.userAnswer
    }));

    // Determine adaptive difficulty
    let nextDifficulty = 'Medium';
    if (currentQuestion.score >= 8) nextDifficulty = 'Hard';
    if (currentQuestion.score <= 4) nextDifficulty = 'Easy';

    const nextQA = await aiService.getNextInterviewQuestion(interview.type, interview.company, history, nextDifficulty);

    interview.questions.push({
      questionText: nextQA.question,
      idealAnswer: nextQA.idealAnswer,
      userAnswer: '',
      aiFeedback: ''
    });

    await interview.save();

    res.json({
      interview,
      isCompleted: false,
      nextQuestion: nextQA.question
    });
  } catch (error) {
    console.error('Submit answer error:', error.message);
    res.status(500).json({ message: 'Server error saving answer' });
  }
};

const endInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Call AI evaluator for final scoring and qualitative feedback
    const qaPairs = interview.questions.map(q => ({
      question: q.questionText,
      answer: q.userAnswer
    }));

    const evaluation = await aiService.evaluateInterview(qaPairs);

    interview.score = evaluation.score;
    interview.metrics = evaluation.metrics;
    interview.feedback = evaluation.feedback;
    interview.status = 'completed';

    await interview.save();

    // Reward XP to User
    const user = await User.findById(req.user.id);
    if (user) {
      user.xp += 150; // 150 XP for completing interview
      if (user.xp >= user.level * 500) {
        user.level += 1;
      }
      await user.save();
    }

    res.json({
      message: 'Interview evaluated successfully',
      interview,
      xpEarned: 150
    });
  } catch (error) {
    console.error('End interview error:', error.message);
    res.status(500).json({ message: 'Server error ending interview' });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const history = await Interview.find({ user: req.user.id, status: 'completed' }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching report' });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  endInterview,
  getInterviewHistory,
  getInterviewReport
};
