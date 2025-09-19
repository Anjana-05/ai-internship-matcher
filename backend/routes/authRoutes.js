import express from 'express';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/signup/:role
// @access  Public
router.post('/signup/:role', async (req, res) => {
  const { role } = req.params;
  const { name, email, password, category, skills, education, locationPreferences, companyName, companyInfo } = req.body; // Use camelCase
  try {
    if (!['student', 'industry'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    let userData = { name, email, password, role };
    if (role === 'student') {
      userData = { ...userData, category, skills, education, locationPreferences };
    } else if (role === 'industry') {
      userData = { ...userData, companyName, companyInfo };
    }

    const user = await User.create(userData);
    console.log('[AUTH] Signup success for email:', email, 'role:', role);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category,
        skills: user.skills,
        education: user.education,
        locationPreferences: user.locationPreferences, // Use camelCase
        companyName: user.companyName, // Use camelCase
        companyInfo: user.companyInfo,   // Use camelCase
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('[AUTH] Signup error:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed', error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login/:role
// @access  Public
router.post('/login/:role', async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;
  try {
    if (!['student', 'industry', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.role !== role) {
      return res.status(400).json({ success: false, message: `Invalid credentials for role ${role}` });
    }

    console.log('[AUTH] Login success for email:', email, 'role:', role);
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category,
        skills: user.skills,
        education: user.education,
        locationPreferences: user.locationPreferences, // Use camelCase
        companyName: user.companyName, // Use camelCase
        companyInfo: user.companyInfo,   // Use camelCase
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed', error: error.message });
  }
});

export default router;
