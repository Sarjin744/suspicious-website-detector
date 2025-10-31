const express = require('express');
const router = express.Router();
const { analyzeWebsite } = require('../controllers/websiteController');
const { protect } = require('../middleware/authMiddleware');
const Website = require('../models/Website');

// 🧠 Analyze a website
router.post('/analyze', protect, analyzeWebsite);

// 📜 Get all analyses by logged-in user
router.get('/my-analyses', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Website.find({ analyzedBy: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch analyses:", err.message);
    res.status(500).json({
      message: 'Failed to fetch analyses',
      error: err.message,
    });
  }
});

// 🔍 Admin-only: View all records (optional for later)
router.get('/all', protect, async (req, res) => {
  try {
    // In future, check for admin role here
    const allRecords = await Website.find().sort({ createdAt: -1 });
    res.json(allRecords);
  } catch (err) {
    console.error("❌ Error fetching all websites:", err.message);
    res.status(500).json({ message: 'Error fetching all data', error: err.message });
  }
});

// 🗑️ Delete a record by ID (future enhancement)
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Website.findOneAndDelete({
      _id: req.params.id,
      analyzedBy: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting record', error: err.message });
  }
});

module.exports = router;
