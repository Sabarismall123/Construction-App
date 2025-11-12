import express from 'express';
import { body, param } from 'express-validator';
import {
  getMaterialConsumptions,
  getMaterialConsumption,
  createMaterialConsumption,
  updateMaterialConsumption,
  deleteMaterialConsumption
} from '../controllers/materialConsumptionController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/material-consumptions
// @desc    Get all material consumptions
// @access  Public (for testing)
router.get('/', getMaterialConsumptions);

// @route   GET /api/material-consumptions/:id
// @desc    Get single material consumption
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid material consumption ID')
], getMaterialConsumption);

// @route   POST /api/material-consumptions
// @desc    Create new material consumption
// @access  Public (for testing)
router.post('/', [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('materialId').isMongoId().withMessage('Invalid material ID'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('consumptionDate').optional().isISO8601().withMessage('Consumption date must be a valid date'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], createMaterialConsumption);

// @route   PUT /api/material-consumptions/:id
// @desc    Update material consumption
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid material consumption ID'),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('materialId').optional().isMongoId().withMessage('Invalid material ID'),
  body('quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('consumptionDate').optional().isISO8601().withMessage('Consumption date must be a valid date'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updateMaterialConsumption);

// @route   DELETE /api/material-consumptions/:id
// @desc    Delete material consumption
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid material consumption ID')
], deleteMaterialConsumption);

export default router;

