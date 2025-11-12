import express from 'express';
import { body, param } from 'express-validator';
import {
  getMaterialReturns,
  getMaterialReturn,
  createMaterialReturn,
  updateMaterialReturn,
  deleteMaterialReturn
} from '../controllers/materialReturnController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/material-returns
// @desc    Get all material returns
// @access  Public (for testing)
router.get('/', getMaterialReturns);

// @route   GET /api/material-returns/:id
// @desc    Get single material return
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid material return ID')
], getMaterialReturn);

// @route   POST /api/material-returns
// @desc    Create new material return
// @access  Public (for testing)
router.post('/', [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('materialId').isMongoId().withMessage('Invalid material ID'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('returnDate').optional().isISO8601().withMessage('Return date must be a valid date'),
  body('receivedBy').trim().isLength({ min: 1, max: 100 }).withMessage('Received by must be between 1 and 100 characters'),
  body('condition').optional().isIn(['good', 'fair', 'poor', 'damaged']).withMessage('Invalid condition'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], createMaterialReturn);

// @route   PUT /api/material-returns/:id
// @desc    Update material return
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid material return ID'),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('materialId').optional().isMongoId().withMessage('Invalid material ID'),
  body('quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('returnDate').optional().isISO8601().withMessage('Return date must be a valid date'),
  body('receivedBy').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Received by must be between 1 and 100 characters'),
  body('condition').optional().isIn(['good', 'fair', 'poor', 'damaged']).withMessage('Invalid condition'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updateMaterialReturn);

// @route   DELETE /api/material-returns/:id
// @desc    Delete material return
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid material return ID')
], deleteMaterialReturn);

export default router;

