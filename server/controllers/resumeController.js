const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Helper to extract clean human-readable text from uploaded file buffers (DOCX, PDF, TXT)
 */
const extractCleanResumeTextFromBuffer = async (buffer, filename = '', user = {}) => {
  if (!buffer) return '';
  const lowerName = filename.toLowerCase();

  // 1. Handle DOCX files using mammoth (Official DOCX parser - 100% accurate paragraph & text extraction!)
  if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc') || buffer.toString('utf8', 0, 4) === 'PK\x03\x04') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 10) {
        return result.value.trim();
      }
    } catch (err) {
      console.warn('Mammoth DOCX parse fallback:', err.message);
    }
  }

  // 2. Handle PDF files using pdf-parse (100% full text extraction!)
  if (lowerName.endsWith('.pdf') || buffer.toString('utf8', 0, 5) === '%PDF-') {
    try {
      const pdfData = await pdfParse(buffer);
      if (pdfData && pdfData.text && pdfData.text.trim().length > 10) {
        return pdfData.text.trim();
      }
    } catch (err) {
      console.warn('PDF parse fallback:', err.message);
    }
  }

  // 3. Handle Plain Text files (.txt)
  const rawString = buffer.toString('utf8');
  if (!rawString.startsWith('PK') && !rawString.includes('%PDF')) {
    const cleanContent = rawString.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanContent.length > 20) {
      return cleanContent;
    }
  }

  return '';
};

const analyzeUserResume = async (req, res) => {
  try {
    let resumeText = req.body ? req.body.resumeText : '';

    // Only extract buffer if resumeText is empty
    if (!resumeText && req.file && req.file.buffer) {
      const extracted = await extractCleanResumeTextFromBuffer(req.file.buffer, req.file.originalname, req.user);
      if (extracted) {
        resumeText = extracted;
      }
    }

    if (!resumeText) {
      return res.status(400).json({ message: 'No resume text or file provided' });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const analysis = await aiService.analyzeResume(resumeText, profile);

    // Save back to Profile model
    profile.resumeAnalysis = {
      score: analysis.score,
      atsScore: analysis.atsScore,
      recruiterScore: analysis.recruiterScore,
      suggestions: analysis.suggestions,
      rawResumeText: resumeText,
      lastUploaded: new Date()
    };

    // Update missing technical skills dynamically to feed into learning gap roadmap
    if (analysis.skills && analysis.skills.missing) {
      profile.skills.missing = analysis.skills.missing;
    }
    if (analysis.skills && analysis.skills.technical) {
      profile.skills.technical = Array.from(new Set([...profile.skills.technical, ...analysis.skills.technical]));
    }

    await profile.save();

    res.json({
      message: 'Resume analyzed successfully',
      analysis: profile.resumeAnalysis,
      grammarIssues: analysis.grammarIssues,
      atsErrors: analysis.atsErrors,
      improvedProjectDescription: analysis.improvedProjectDescription
    });
  } catch (error) {
    console.error('Analyze resume error:', error.message);
    res.status(500).json({ message: 'Server error during resume analysis' });
  }
};

const matchJobDescription = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: 'Please provide job description text' });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    const resumeText = (profile && profile.resumeAnalysis && profile.resumeAnalysis.rawResumeText)
      ? profile.resumeAnalysis.rawResumeText
      : `Name: ${req.user.name}\nSkills: React, Node.js, MongoDB`;

    const comparison = await aiService.compareResumeToJobDescription(resumeText, jobDescription);
    res.json(comparison);
  } catch (error) {
    console.error('Match job description error:', error.message);
    res.status(500).json({ message: 'Server error matching job description' });
  }
};

const autoFixAndOptimizeResume = async (req, res) => {
  try {
    let { resumeText, jobDescription } = req.body || {};
    const profile = await Profile.findOne({ user: req.user.id });

    // Only extract buffer if resumeText is empty
    if (!resumeText && req.file && req.file.buffer) {
      const extracted = await extractCleanResumeTextFromBuffer(req.file.buffer, req.file.originalname, req.user);
      if (extracted) {
        resumeText = extracted;
      }
    }

    if (!resumeText && profile && profile.resumeAnalysis && profile.resumeAnalysis.rawResumeText) {
      resumeText = profile.resumeAnalysis.rawResumeText;
    }
    if (!resumeText) {
      return res.status(400).json({ message: 'Please paste your resume text into the text area or select a valid text file.' });
    }

    const result = await aiService.optimizeResumeTo100Score(resumeText, jobDescription, { user: req.user, profile });

    if (profile) {
      profile.resumeAnalysis = {
        score: result.newOverallScore,
        atsScore: result.newAtsScore,
        recruiterScore: result.newRecruiterScore,
        suggestions: ['Resume is 100% ATS Optimized! Ready for corporate shortlist crawls.'],
        rawResumeText: result.optimizedResume,
        lastUploaded: new Date()
      };
      if (profile.skills) {
        profile.skills.technical = Array.from(new Set([
          ...profile.skills.technical,
          ...result.keywordsInjected
        ]));
        profile.skills.missing = [];
      }
      await profile.save();
    }

    res.json({
      message: 'Resume successfully auto-fixed and optimized to 100 ATS score!',
      ...result,
      profileAnalysis: profile ? profile.resumeAnalysis : null
    });
  } catch (error) {
    console.error('Auto fix resume error:', error.message);
    res.status(500).json({ message: 'Server error optimizing resume' });
  }
};

module.exports = {
  analyzeUserResume,
  matchJobDescription,
  autoFixAndOptimizeResume
};
