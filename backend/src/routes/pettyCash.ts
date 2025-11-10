import express from 'express';
import { body, param } from 'express-validator';
import {
  getPettyCashEntries,
  getPettyCashEntry,
  createPettyCashEntry,
  updatePettyCashEntry,
  deletePettyCashEntry,
  getPettyCashEntriesByProject
} from '../controllers/pettyCashController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/petty-cash
// @desc    Get all petty cash entries
// @access  Public (for testing)
router.get('/', getPettyCashEntries);

// @route   GET /api/petty-cash/project/:projectId
// @desc    Get petty cash entries by project
// @access  Public (for testing)
router.get('/project/:projectId', [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], getPettyCashEntriesByProject);

// @route   GET /api/petty-cash/:id
// @desc    Get single petty cash entry
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid petty cash entry ID')
], getPettyCashEntry);

// @route   POST /api/petty-cash
// @desc    Create new petty cash entry
// @access  Private
router.post('/', protect, [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Description must be between 1 and 200 characters'),
  body('category').optional().isIn(['fuel', 'meals', 'transport', 'supplies', 'other']).withMessage('Invalid category'),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'reimbursed']).withMessage('Invalid status'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('receiptNumber').optional().trim().isLength({ max: 50 }).withMessage('Receipt number cannot exceed 50 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], createPettyCashEntry);

// @route   PUT /api/petty-cash/:id
// @desc    Update petty cash entry
// @access  Private
router.put('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid petty cash entry ID'),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Description must be between 1 and 200 characters'),
  body('category').optional().isIn(['fuel', 'meals', 'transport', 'supplies', 'other']).withMessage('Invalid category'),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'reimbursed']).withMessage('Invalid status'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('receiptNumber').optional().trim().isLength({ max: 50 }).withMessage('Receipt number cannot exceed 50 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updatePettyCashEntry);

// @route   DELETE /api/petty-cash/:id
// @desc    Delete petty cash entry
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid petty cash entry ID')
], deletePettyCashEntry);

export default router;
