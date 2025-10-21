import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Placeholder routes for commercial
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Commercial routes - Coming soon' });
});

export default router;
