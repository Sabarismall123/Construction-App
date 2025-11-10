import express from 'express';
import { body, param } from 'express-validator';
import {
  getMaterialIssues,
  getMaterialIssue,
  createMaterialIssue,
  updateMaterialIssue,
  deleteMaterialIssue
} from '../controllers/materialIssueController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/material-issues
// @desc    Get all material issues
// @access  Public (for testing)
router.get('/', getMaterialIssues);

// @route   GET /api/material-issues/:id
// @desc    Get single material issue
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid material issue ID')
], getMaterialIssue);

// @route   POST /api/material-issues
// @desc    Create new material issue
// @access  Public (for testing)
router.post('/', [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('materialId').isMongoId().withMessage('Invalid material ID'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('issuedDate').optional().isISO8601().withMessage('Issue date must be a valid date'),
  body('issuedTo').trim().isLength({ min: 1, max: 100 }).withMessage('Issued to must be between 1 and 100 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], createMaterialIssue);

// @route   PUT /api/material-issues/:id
// @desc    Update material issue
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid material issue ID'),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('materialId').optional().isMongoId().withMessage('Invalid material ID'),
  body('quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('issuedDate').optional().isISO8601().withMessage('Issue date must be a valid date'),
  body('issuedTo').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Issued to must be between 1 and 100 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updateMaterialIssue);

// @route   DELETE /api/material-issues/:id
// @desc    Delete material issue
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid material issue ID')
], deleteMaterialIssue);

export default router;

