import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import Opportunity from '../models/Opportunity.js';

const router = express.Router();

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const opportunities = await Opportunity.find({}).populate('company', 'companyName');
    return res.json(opportunities);
  } catch (error) {
    console.error('[OPPORTUNITIES] List error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load opportunities', error: error.message });
  }
});

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate('company', 'companyName companyInfo'); // Populate more company info
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    return res.json(opportunity);
  } catch (error) {
    console.error('[OPPORTUNITIES] Detail error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load opportunity', error: error.message });
  }
});

// @desc    Create a new opportunity
// @route   POST /api/opportunities
// @access  Private/Industry
router.post('/', protect, authorizeRoles('industry'), async (req, res) => {
  try {
    const { title, location, sector, duration, capacity, description, affirmativeCategory } = req.body; // Use camelCase
    if (!title || !location || !sector || !duration || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const numCapacity = Number(capacity);
    if (!numCapacity || numCapacity <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be a positive number' });
    }
    console.log('[OPPORTUNITIES] POST body:', { title, location, sector, duration, capacity, affirmativeCategory }, 'user:', req.user?._id?.toString());
    const opportunity = new Opportunity({
      title: String(title).trim(),
      company: req.user._id,
      location: String(location).trim(),
      sector: String(sector).trim(),
      duration: String(duration).trim(),
      capacity: numCapacity,
      description: String(description).trim(),
      affirmativeCategory: affirmativeCategory || undefined,
    });
    const createdOpportunity = await opportunity.save();
    return res.status(201).json(createdOpportunity);
  } catch (error) {
    console.error('[OPPORTUNITIES] Create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create opportunity', error: error.message });
  }
});

// @desc    Update an opportunity
// @route   PUT /api/opportunities/:id
// @access  Private/Industry/Admin
router.put('/:id', protect, authorizeRoles('industry', 'admin'), async (req, res) => {
  const { title, location, sector, duration, capacity, description, affirmativeCategory, status } = req.body; // Use camelCase

  const opportunity = await Opportunity.findById(req.params.id);

  if (opportunity) {
    // Check if the industry user owns this opportunity
    if (req.user.role === 'industry' && opportunity.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this opportunity' });
    }

    opportunity.title = title || opportunity.title;
    opportunity.location = location || opportunity.location;
    opportunity.sector = sector || opportunity.sector;
    opportunity.duration = duration || opportunity.duration;
    opportunity.capacity = capacity || opportunity.capacity;
    opportunity.description = description || opportunity.description;
    opportunity.affirmativeCategory = affirmativeCategory || opportunity.affirmativeCategory; // Use camelCase
    opportunity.status = status || opportunity.status;

    const updatedOpportunity = await opportunity.save();
    res.json(updatedOpportunity);
  } else {
    res.status(404).json({ message: 'Opportunity not found' });
  }
});

// @desc    Delete an opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private/Industry/Admin
router.delete('/:id', protect, authorizeRoles('industry', 'admin'), async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (opportunity) {
    // Check if the industry user owns this opportunity
    if (req.user.role === 'industry' && opportunity.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this opportunity' });
    }

    await Opportunity.deleteOne({ _id: req.params.id });
    res.json({ message: 'Opportunity removed' });
  } else {
    res.status(404).json({ message: 'Opportunity not found' });
  }
});

export default router;
