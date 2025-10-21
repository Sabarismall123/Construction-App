import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Placeholder routes for petty cash
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Petty Cash routes - Coming soon' });
});

export default router;
