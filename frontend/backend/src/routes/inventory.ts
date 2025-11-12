import express from 'express';
import { body, param } from 'express-validator';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventoryController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Public (for testing)
router.get('/', getInventoryItems);

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid inventory item ID')
], getInventoryItem);

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Public (for testing)
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Item name must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required'),
  body('currentStock').isFloat({ min: 0 }).withMessage('Current stock must be a non-negative number'),
  body('minThreshold').optional().isFloat({ min: 0 }).withMessage('Minimum threshold must be a non-negative number'),
  body('maxThreshold').optional().isFloat({ min: 0 }).withMessage('Maximum threshold must be a non-negative number'),
  body('unit').optional().isIn(['pcs', 'kg', 'tons', 'm', 'sqm', 'cum', 'bags']).withMessage('Invalid unit'),
  body('unitCost').isFloat({ min: 0 }).withMessage('Unit cost must be a non-negative number'),
  body('supplier').optional().trim().isLength({ max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters')
], createInventoryItem);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid inventory item ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Item name must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be a non-negative number'),
  body('minThreshold').optional().isFloat({ min: 0 }).withMessage('Minimum threshold must be a non-negative number'),
  body('maxThreshold').optional().isFloat({ min: 0 }).withMessage('Maximum threshold must be a non-negative number'),
  body('unit').optional().isIn(['pcs', 'kg', 'tons', 'm', 'sqm', 'cum', 'bags']).withMessage('Invalid unit'),
  body('unitCost').optional().isFloat({ min: 0 }).withMessage('Unit cost must be a non-negative number'),
  body('supplier').optional().trim().isLength({ max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters')
], updateInventoryItem);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid inventory item ID')
], deleteInventoryItem);

export default router;

