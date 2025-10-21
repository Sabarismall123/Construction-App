import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Placeholder routes for resources
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Resources routes - Coming soon' });
});

export default router;
