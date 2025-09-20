import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadProfileDocuments, handleUploadErrors, deleteOldFile } from '../middleware/profileUploadMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Predefined skills list
const PREDEFINED_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'SQLite',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
  'Git', 'GitHub', 'GitLab', 'Jira', 'Figma', 'Adobe XD',
  'Machine Learning', 'Data Science', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch',
  'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
  'DevOps', 'CI/CD', 'Linux', 'Windows', 'macOS'
];

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return profile with predefined skills for frontend
    res.json({
      success: true,
      user: user,
      predefinedSkills: PREDEFINED_SKILLS
    });
  } catch (error) {
    console.error('[PROFILE] Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private/Student
router.put('/', protect, authorizeRoles('student'), uploadProfileDocuments, handleUploadErrors, async (req, res) => {
  try {
    console.log('[PROFILE] Update request received');
    console.log('[PROFILE] Body:', req.body);
    console.log('[PROFILE] Files:', req.files);

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Extract form data
    const {
      name,
      education,
      locationPreferences,
      category,
      skills, // This will be an array from frontend
      linkedinUrl,
      githubUrl,
      leetcodeUrl,
      extraCertificateDescriptions // Array of descriptions for extra certificates
    } = req.body;

    // Update basic fields
    if (name) user.name = name;
    if (education) user.education = education;
    if (locationPreferences) user.locationPreferences = locationPreferences;
    if (category) user.category = category;

    // Handle skills array
    if (skills) {
      // The frontend sends skills as a JSON string, so we need to parse it
      try {
        const parsedSkills = JSON.parse(skills);
        if (Array.isArray(parsedSkills)) {
          user.skills = parsedSkills.filter(skill => typeof skill === 'string' && skill.trim());
        }
      } catch (e) {
        console.error('Error parsing skills:', e);
        // Handle cases where skills might not be a valid JSON string
        user.skills = [];
      }
    } else {
      user.skills = [];
    }

    // Initialize profile object if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }

    // Handle file uploads
    if (req.files) {
      // Handle resume
      if (req.files.resume && req.files.resume[0]) {
        const resumeFile = req.files.resume[0];
        
        // Delete old resume if exists
        if (user.profile.resume && user.profile.resume.path) {
          deleteOldFile(user.profile.resume.path);
        }
        
        user.profile.resume = {
          filename: resumeFile.filename,
          originalName: resumeFile.originalname,
          path: resumeFile.path,
          uploadedAt: new Date()
        };
      }

      // Handle marksheet
      if (req.files.marksheet && req.files.marksheet[0]) {
        const marksheetFile = req.files.marksheet[0];
        
        // Delete old marksheet if exists
        if (user.profile.marksheet && user.profile.marksheet.path) {
          deleteOldFile(user.profile.marksheet.path);
        }
        
        user.profile.marksheet = {
          filename: marksheetFile.filename,
          originalName: marksheetFile.originalname,
          path: marksheetFile.path,
          uploadedAt: new Date()
        };
      }

      // Handle community certificate
      if (req.files.communityCertificate && req.files.communityCertificate[0]) {
        const communityFile = req.files.communityCertificate[0];
        
        // Delete old community certificate if exists
        if (user.profile.communityCertificate && user.profile.communityCertificate.path) {
          deleteOldFile(user.profile.communityCertificate.path);
        }
        
        user.profile.communityCertificate = {
          filename: communityFile.filename,
          originalName: communityFile.originalname,
          path: communityFile.path,
          uploadedAt: new Date()
        };
      }

      // Handle extra certificates
      if (req.files.extraCertificates && req.files.extraCertificates.length > 0) {
        // Initialize extraCertificates array if it doesn't exist
        if (!user.profile.extraCertificates) {
          user.profile.extraCertificates = [];
        }

        // Parse descriptions if provided
        let descriptions = [];
        if (extraCertificateDescriptions) {
          descriptions = Array.isArray(extraCertificateDescriptions) 
            ? extraCertificateDescriptions 
            : JSON.parse(extraCertificateDescriptions || '[]');
        }

        // Add new certificates
        req.files.extraCertificates.forEach((file, index) => {
          user.profile.extraCertificates.push({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            description: descriptions[index] || file.originalname,
            uploadedAt: new Date()
          });
        });
      }
    }

    // Handle optional links
    if (linkedinUrl !== undefined) user.profile.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) user.profile.githubUrl = githubUrl;
    if (leetcodeUrl !== undefined) user.profile.leetcodeUrl = leetcodeUrl;

    // Check if profile is complete
    const isComplete = !!(
      user.profile.resume && 
      user.profile.marksheet && 
      user.profile.communityCertificate &&
      user.skills && user.skills.length > 0 &&
      user.education &&
      user.locationPreferences
    );

    user.profile.isProfileComplete = isComplete;
    user.profile.lastUpdated = new Date();

    // Save user
    await user.save();

    console.log('[PROFILE] Profile updated successfully for user:', user.email);

    // Return updated user (without password)
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      profileComplete: isComplete
    });

  } catch (error) {
    console.error('[PROFILE] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @desc    Delete extra certificate
// @route   DELETE /api/profile/certificate/:certificateId
// @access  Private/Student
router.delete('/certificate/:certificateId', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const userId = req.user._id;
    const certificateId = req.params.certificateId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.profile || !user.profile.extraCertificates) {
      return res.status(404).json({
        success: false,
        message: 'No certificates found'
      });
    }

    // Find and remove certificate
    const certificateIndex = user.profile.extraCertificates.findIndex(
      cert => cert._id.toString() === certificateId
    );

    if (certificateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Delete file from filesystem
    const certificate = user.profile.extraCertificates[certificateIndex];
    if (certificate.path) {
      deleteOldFile(certificate.path);
    }

    // Remove from array
    user.profile.extraCertificates.splice(certificateIndex, 1);
    user.profile.lastUpdated = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });

  } catch (error) {
    console.error('[PROFILE] Delete certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate',
      error: error.message
    });
  }
});

// @desc    Get predefined skills
// @route   GET /api/profile/skills
// @access  Public
router.get('/skills', (req, res) => {
  res.json({
    success: true,
    skills: PREDEFINED_SKILLS
  });
});

export default router;
