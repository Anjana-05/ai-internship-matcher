import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import MatchResult from '../models/MatchResult.js';

const router = express.Router();

// Weights for AI matching (can be configured via .env)
const WEIGHTS = {
  skill: parseFloat(process.env.SKILL_WEIGHT) || 0.5,
  sector: parseFloat(process.env.SECTOR_WEIGHT) || 0.2,
  location: parseFloat(process.env.LOCATION_WEIGHT) || 0.2,
  affirmative: parseFloat(process.env.AFFIRMATIVE_WEIGHT) || 0.1,
};

// Simple deterministic scoring function
const computeScore = (student, opportunity) => {
  let score = 0;
  const breakdown = {};

  // 1. Skill Overlap
  const studentSkills = new Set((student.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean));
  const opportunityKeywords = new Set((
    (opportunity.description || '') + ',' +
    (opportunity.sector || '')
  ).toLowerCase().split(',').map(s => s.trim()).filter(Boolean));
  
  const commonSkills = [...studentSkills].filter(skill => opportunityKeywords.has(skill));
  const skillOverlap = studentSkills.size > 0 ? (commonSkills.length / studentSkills.size) : 0;
  score += WEIGHTS.skill * skillOverlap;
  breakdown.skillOverlap = skillOverlap;

  // 2. Sector Match (using student.skills as interests for now)
  const studentSectorInterests = new Set((student.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean));
  const opportunitySectors = new Set((opportunity.sector || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean));
  const sectorMatch = [...studentSectorInterests].some(interest => opportunitySectors.has(interest)) ? 1 : 0;
  score += WEIGHTS.sector * sectorMatch;
  breakdown.sectorMatch = sectorMatch;

  // 3. Location Preference
  const studentLocationPreferences = new Set((student.locationPreferences || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)); // Use camelCase
  const locationMatch = studentLocationPreferences.has((opportunity.location || '').toLowerCase().trim()) ? 1 : 0;
  score += WEIGHTS.location * locationMatch;
  breakdown.locationMatch = locationMatch;

  // 4. Affirmative Action Priority
  const affirmative = (opportunity.affirmativeCategory && student.category && opportunity.affirmativeCategory === student.category) ? 1 : 0; // Use camelCase
  score += WEIGHTS.affirmative * affirmative;
  breakdown.affirmative = affirmative;

  return { score: Math.round(score * 100) / 100, breakdown }; // Round to 2 decimal places
};

// @desc    Trigger AI matching run
// @route   POST /api/match/run
// @access  Private/Admin
router.post('/run', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    // Clear previous match results to ensure fresh data
    await MatchResult.deleteMany({});

    const applications = await Application.find({}).populate('student').populate('opportunity');
    let createdResults = 0;

    for (const app of applications) {
      const { student, opportunity } = app;

      if (student && opportunity) {
        const { score, breakdown } = computeScore(student, opportunity);

        const matchResult = new MatchResult({
          student: student._id,
          opportunity: opportunity._id,
          score,
          explanation: JSON.stringify(breakdown),
        });
        await matchResult.save();
        createdResults++;
      }
    }
    res.status(200).json({ processedApplications: applications.length, createdResults });
  } catch (error) {
    console.error('AI Match Run Error:', error);
    res.status(500).json({ message: 'Failed to trigger AI match run', error: error.message });
  }
});

// @desc    Get AI matching results
// @route   GET /api/match/results
// @access  Private/Admin
router.get('/results', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const matchResults = await MatchResult.find({}).populate('student', 'name email').populate('opportunity', 'title company location').sort({ score: -1 });
    res.status(200).json(matchResults);
  } catch (error) {
    console.error('Get AI Match Results Error:', error);
    res.status(500).json({ message: 'Failed to fetch AI match results', error: error.message });
  }
});

// @desc    Get current student's AI matching results
// @route   GET /api/match/my-results
// @access  Private/Student
router.get('/my-results', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const studentId = req.user._id;
    const myResults = await MatchResult
      .find({ student: studentId })
      .populate({ path: 'opportunity', select: 'title company location', populate: { path: 'company', select: 'companyName' } })
      .sort({ score: -1 });
    return res.status(200).json(myResults);
  } catch (error) {
    console.error('[MATCH] My Results error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch your AI match results', error: error.message });
  }
});

export default router;
