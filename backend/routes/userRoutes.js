import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.json(users);
  } catch (error) {
    console.error('[USERS] List error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load users', error: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private (User can get their own, Admin can get any)
router.get('/:id', protect, async (req, res) => {
  try {
    console.log('[USERS] GET /:id DEBUG user id:', req.user?.id, 'params:', req.params);
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid user id in params' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user && (req.user._id.toString() === user._id.toString() || req.user.role === 'admin')) {
      return res.json(user);
    }
    return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
  } catch (error) {
    console.error('[USERS] Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load profile', error: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (User can update their own, Admin can update any)
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('[USERS] PUT /:id DEBUG user id:', req.user?.id, 'params:', req.params);
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid user id in params' });
    }

    const { name, email, category, skills, education, locationPreferences, companyName, companyInfo } = req.body; // Use camelCase
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!(req.user && (req.user._id.toString() === user._id.toString() || req.user.role === 'admin'))) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.category = category || user.category;
    user.skills = skills || user.skills;
    user.education = education || user.education;
    user.locationPreferences = locationPreferences || user.locationPreferences; // Use camelCase
    user.companyName = companyName || user.companyName; // Use camelCase
    user.companyInfo = companyInfo || user.companyInfo;   // Use camelCase

    const updatedUser = await user.save();
    return res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      category: updatedUser.category,
      skills: updatedUser.skills,
      education: updatedUser.education,
      locationPreferences: updatedUser.locationPreferences, // Use camelCase
      companyName: updatedUser.companyName, // Use camelCase
      companyInfo: updatedUser.companyInfo,   // Use camelCase
    });
  } catch (error) {
    console.error('[USERS] Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid user id in params' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await User.deleteOne({ _id: id });
    return res.json({ success: true, message: 'User removed' });
  } catch (error) {
    console.error('[USERS] Delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

export default router;
