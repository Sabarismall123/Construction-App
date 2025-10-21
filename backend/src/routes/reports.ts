import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Placeholder routes for reports
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Reports routes - Coming soon' });
});

export default router;
