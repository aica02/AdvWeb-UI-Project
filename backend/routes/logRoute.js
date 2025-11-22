import express from 'express';
import Log from '../models/logModel.js';
import { protect, adminOnly } from '../middleware/authMiddlew.js';

const router = express.Router();

// Get all logs (admin)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const logs = await Log.find().populate('actor', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a log entry (internal use)
router.post('/', protect, async (req, res) => {
  try {
    const { action, meta } = req.body;
    const log = await Log.create({ actor: req.user._id, actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(), action, meta });
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
