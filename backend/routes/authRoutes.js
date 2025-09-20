import express from 'express';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/signup/:role
// @access  Public
router.post('/signup/:role', async (req, res) => {
  const { role } = req.params;
  const { name, email, password, category, skills, education, locationPreferences, companyName, companyInfo } = req.body;
  
  console.log('[AUTH] Signup attempt - Role:', role, 'Email:', email, 'Name:', name);
  
  try {
    // Validate role
    if (!['student', 'industry'].includes(role)) {
      console.log('[AUTH] Invalid role for signup:', role);
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('[AUTH] User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Validate required fields
    if (!name || !email || !password) {
      console.log('[AUTH] Missing required fields - Name:', !!name, 'Email:', !!email, 'Password:', !!password);
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    // Build user data based on role
    let userData = { name, email, password, role };
    if (role === 'student') {
      userData = { ...userData, category, skills, education, locationPreferences };
      console.log('[AUTH] Student signup data:', { name, email, role, category, skills: !!skills, education: !!education });
    } else if (role === 'industry') {
      userData = { ...userData, companyName, companyInfo };
      console.log('[AUTH] Industry signup data:', { name, email, role, companyName, companyInfo: !!companyInfo });
    }

    // Create user
    console.log('[AUTH] Creating user in database...');
    const user = await User.create(userData);
    console.log('[AUTH] User created successfully with ID:', user._id);
    
    // Generate token
    const token = generateToken(user._id, user.role);
    console.log('[AUTH] Token generated for new user');
    
    console.log('[AUTH] Signup success for email:', email, 'role:', role);

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category,
        skills: user.skills,
        education: user.education,
        locationPreferences: user.locationPreferences,
        companyName: user.companyName,
        companyInfo: user.companyInfo,
      },
      token: token,
    });
  } catch (error) {
    console.error('[AUTH] Signup error:', error);
    console.error('[AUTH] Error details:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login/:role
// @access  Public
router.post('/login/:role', async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;
  
  console.log('[AUTH] Login attempt - Role:', role, 'Email:', email);
  
  try {
    // Validate input
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    if (!['student', 'industry', 'admin'].includes(role)) {
      console.log('[AUTH] Invalid role:', role);
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('[AUTH] User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('[AUTH] User not found for email:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('[AUTH] User role in DB:', user.role, 'Requested role:', role);
    
    // Check role match first
    if (user.role !== role) {
      console.log('[AUTH] Role mismatch - DB role:', user.role, 'Requested:', role);
      return res.status(400).json({ success: false, message: `Invalid credentials for role ${role}` });
    }

    // Verify password
    console.log('[AUTH] Checking password...');
    const isMatch = await user.matchPassword(password);
    console.log('[AUTH] Password match:', isMatch);
    
    if (!isMatch) {
      console.log('[AUTH] Password mismatch for email:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);
    console.log('[AUTH] Token generated successfully');
    
    console.log('[AUTH] Login success for email:', email, 'role:', role);
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category,
        skills: user.skills,
        education: user.education,
        locationPreferences: user.locationPreferences,
        companyName: user.companyName,
        companyInfo: user.companyInfo,
      },
      token: token,
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed', error: error.message });
  }
});

export default router;
