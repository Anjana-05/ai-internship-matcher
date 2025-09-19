import express from 'express';
import Opportunity from '../models/Opportunity.js';

const router = express.Router();

// @desc    Get distinct locations from opportunities
// @route   GET /api/meta/locations
// @access  Public
router.get('/locations', async (req, res) => {
  try {
    const locations = await Opportunity.distinct('location');
    return res.json(locations.filter(Boolean).sort());
  } catch (error) {
    console.error('[META] Locations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load locations', error: error.message });
  }
});

export default router;
