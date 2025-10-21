import express from 'express';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Placeholder routes for users
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Users routes - Coming soon' });
});

export default router;
