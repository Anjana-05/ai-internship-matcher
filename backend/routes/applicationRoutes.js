import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @desc    Apply for an opportunity
// @route   POST /api/applications
// @access  Private/Student
// Simple test route to verify applications endpoint is working
router.get('/test', (req, res) => {
  res.json({ message: 'Applications route is working', timestamp: new Date().toISOString() });
});

router.post('/', protect, authorizeRoles('student'), uploadResume.single('resume'), async (req, res) => {
  try {
    console.log('[APPLICATIONS] POST request received');
    console.log('[APPLICATIONS] Body:', req.body);
    console.log('[APPLICATIONS] File:', req.file);
    console.log('[APPLICATIONS] User:', req.user?._id);
    
    const {
      opportunityId,
      fullName,
      email,
      phone,
      locationPreference,
      educationLevel,
      degreeMajor,
      yearOfStudy,
      cgpa,
      skills, // comma or array
      sectorInterests, // comma or array
      pastInternship,
      isRuralOrAspirational,
      socialCategory,
      hasDisability,
    } = req.body;

    if (!opportunityId) {
      console.log('[APPLICATIONS] ERROR: Missing opportunityId');
      return res.status(400).json({ success: false, message: 'Missing opportunityId' });
    }
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      console.log('[APPLICATIONS] ERROR: Opportunity not found for ID:', opportunityId);
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    console.log('[APPLICATIONS] Found opportunity:', opportunity.title);

    const existingApplication = await Application.findOne({ student: req.user._id, opportunity: opportunityId });
    if (existingApplication) {
      console.log('[APPLICATIONS] ERROR: Already applied');
      return res.status(400).json({ success: false, message: 'Already applied to this opportunity' });
    }

    // Basic required validation for form fields
    const missing = [];
    if (!fullName) missing.push('fullName');
    if (!email) missing.push('email');
    if (!phone) missing.push('phone');
    if (!locationPreference) missing.push('locationPreference');
    if (!educationLevel) missing.push('educationLevel');
    if (!degreeMajor) missing.push('degreeMajor');
    if (!yearOfStudy) missing.push('yearOfStudy');
    if (!cgpa) missing.push('cgpa');
    if (!skills) missing.push('skills');
    if (!req.file) missing.push('resume');
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    const skillsArr = Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean);
    const sectorArr = sectorInterests ? (Array.isArray(sectorInterests) ? sectorInterests : String(sectorInterests).split(',').map(s => s.trim()).filter(Boolean)) : [];

    const file = req.file;
    const resumeMeta = file ? {
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `${req.protocol}://${req.get('host')}/uploads/resumes/${file.filename}`,
    } : undefined;

    const application = new Application({
      student: req.user._id,
      opportunity: opportunityId,
      status: 'applied',
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      locationPreference: String(locationPreference).trim(),
      educationLevel,
      degreeMajor: String(degreeMajor).trim(),
      yearOfStudy,
      cgpa: Number(cgpa),
      skills: skillsArr,
      sectorInterests: sectorArr,
      pastInternship: pastInternship ? String(pastInternship) : '',
      isRuralOrAspirational: isRuralOrAspirational === 'true' || isRuralOrAspirational === true,
      socialCategory: socialCategory || '',
      hasDisability: hasDisability === 'true' || hasDisability === true,
      resume: resumeMeta,
    });

    const createdApplication = await application.save();
    console.log('[APPLICATIONS] SUCCESS: Application created with ID:', createdApplication._id);
    return res.status(201).json(createdApplication);
  } catch (error) {
    console.error('[APPLICATIONS] Create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
});

// @desc    Get student's applications
// @route   GET /api/applications/me
// @access  Private/Student
router.get('/me', protect, authorizeRoles('student'), async (req, res) => {
  const applications = await Application.find({ student: req.user._id }).populate('opportunity', 'title company location');
  res.json(applications);
});

// @desc    Get applicants for a specific opportunity
// @route   GET /api/applications/opportunity/:id
// @access  Private/Industry
router.get('/opportunity/:id', protect, authorizeRoles('industry'), async (req, res) => {
  const opportunityId = req.params.id;

  // Verify that the industry user owns this opportunity
  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    return res.status(404).json({ message: 'Opportunity not found' });
  }
  if (opportunity.company.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view applicants for this opportunity' });
  }

  const applicants = await Application.find({ opportunity: opportunityId }).populate('student', 'name email skills category locationPreferences'); // Populate more student info
  res.json(applicants);
});

// @desc    Update application status (e.g., pending, selected, rejected)
// @route   PUT /api/applications/:id/status
// @access  Private/Industry
router.put('/:id/status', protect, authorizeRoles('industry'), async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params.id;

  const application = await Application.findById(applicationId);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Verify that the industry user owns the associated opportunity
  const opportunity = await Opportunity.findById(application.opportunity);
  if (!opportunity || opportunity.company.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this application' });
  }

  application.status = status;
  const updatedApplication = await application.save();
  res.json(updatedApplication);
});

export default router;
