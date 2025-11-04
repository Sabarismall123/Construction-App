import express from 'express';
import { body, param } from 'express-validator';
import {
  getCommercialEntries,
  getCommercialEntry,
  createCommercialEntry,
  updateCommercialEntry,
  deleteCommercialEntry,
  getCommercialEntriesByProject
} from '../controllers/commercialController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/commercial
// @desc    Get all commercial entries
// @access  Public (for testing)
router.get('/', getCommercialEntries);

// @route   GET /api/commercial/project/:projectId
// @desc    Get commercial entries by project
// @access  Public (for testing)
router.get('/project/:projectId', [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], getCommercialEntriesByProject);

// @route   GET /api/commercial/:id
// @desc    Get single commercial entry
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid commercial entry ID')
], getCommercialEntry);

// @route   POST /api/commercial
// @desc    Create new commercial entry
// @access  Public (for testing)
router.post('/', [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('type').optional().isIn(['invoice', 'payment', 'expense', 'purchase_order', 'other']).withMessage('Invalid type'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'paid', 'cancelled']).withMessage('Invalid status'),
  body('vendor').optional().trim().isLength({ max: 100 }).withMessage('Vendor name cannot exceed 100 characters'),
  body('invoiceNumber').optional().trim().isLength({ max: 50 }).withMessage('Invoice number cannot exceed 50 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], createCommercialEntry);

// @route   PUT /api/commercial/:id
// @desc    Update commercial entry
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid commercial entry ID'),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('type').optional().isIn(['invoice', 'payment', 'expense', 'purchase_order', 'other']).withMessage('Invalid type'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'paid', 'cancelled']).withMessage('Invalid status'),
  body('vendor').optional().trim().isLength({ max: 100 }).withMessage('Vendor name cannot exceed 100 characters'),
  body('invoiceNumber').optional().trim().isLength({ max: 50 }).withMessage('Invoice number cannot exceed 50 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], updateCommercialEntry);

// @route   DELETE /api/commercial/:id
// @desc    Delete commercial entry
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid commercial entry ID')
], deleteCommercialEntry);

export default router;
