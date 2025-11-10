import express from 'express';
import { body, param } from 'express-validator';
import {
  getSiteTransfers,
  getSiteTransfer,
  createSiteTransfer,
  updateSiteTransfer,
  deleteSiteTransfer
} from '../controllers/siteTransferController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/site-transfers
// @desc    Get all site transfers
// @access  Public (for testing)
router.get('/', getSiteTransfers);

// @route   GET /api/site-transfers/:id
// @desc    Get single site transfer
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid site transfer ID')
], getSiteTransfer);

// @route   POST /api/site-transfers
// @desc    Create new site transfer
// @access  Public (for testing)
router.post('/', [
  body('fromProjectId').isMongoId().withMessage('Invalid from project ID'),
  body('toProjectId').isMongoId().withMessage('Invalid to project ID'),
  body('materialId').isMongoId().withMessage('Invalid material ID'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('transferDate').optional().isISO8601().withMessage('Transfer date must be a valid date'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], createSiteTransfer);

// @route   PUT /api/site-transfers/:id
// @desc    Update site transfer
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid site transfer ID'),
  body('fromProjectId').optional().isMongoId().withMessage('Invalid from project ID'),
  body('toProjectId').optional().isMongoId().withMessage('Invalid to project ID'),
  body('materialId').optional().isMongoId().withMessage('Invalid material ID'),
  body('quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('transferDate').optional().isISO8601().withMessage('Transfer date must be a valid date'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], updateSiteTransfer);

// @route   DELETE /api/site-transfers/:id
// @desc    Delete site transfer
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid site transfer ID')
], deleteSiteTransfer);

export default router;

