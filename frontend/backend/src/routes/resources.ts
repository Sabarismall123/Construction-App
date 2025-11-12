import express from 'express';
import { body, param } from 'express-validator';
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getResourcesByProject
} from '../controllers/resourceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public (for testing)
router.get('/', getResources);

// @route   GET /api/resources/project/:projectId
// @desc    Get resources by project
// @access  Public (for testing)
router.get('/project/:projectId', [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], getResourcesByProject);

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid resource ID')
], getResource);

// @route   POST /api/resources
// @desc    Create new resource
// @access  Public (for testing)
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('type').optional().isIn(['equipment', 'material', 'vehicle', 'tool', 'other', 'labor']).withMessage('Invalid resource type'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),
  body('description').optional().trim().isLength({ min: 0, max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('unit').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Unit must be between 1 and 20 characters'),
  body('costPerUnit').optional().isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('supplier').optional().trim().isLength({ min: 0, max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  body('location').optional().trim().isLength({ min: 0, max: 200 }).withMessage('Location cannot exceed 200 characters'),
  body('status').optional().isIn(['available', 'in_use', 'maintenance', 'out_of_order', 'allocated', 'retired']).withMessage('Invalid status'),
  body('assignedTo').optional().custom((value) => {
    if (typeof value === 'string' && value.length > 0) {
      return true;
    }
    throw new Error('Invalid assigned user ID');
  }),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date'),
  body('warrantyExpiry').optional().isISO8601().withMessage('Warranty expiry must be a valid date'),
  body('maintenanceSchedule').optional().isISO8601().withMessage('Maintenance schedule must be a valid date'),
  body('notes').optional().trim().isLength({ min: 0, max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], createResource);

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid resource ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('type').optional().isIn(['equipment', 'material', 'vehicle', 'tool', 'other', 'labor']).withMessage('Invalid resource type'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),
  body('description').optional().trim().isLength({ min: 0, max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('unit').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Unit must be between 1 and 20 characters'),
  body('costPerUnit').optional().isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('supplier').optional().trim().isLength({ min: 0, max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  body('location').optional().trim().isLength({ min: 0, max: 200 }).withMessage('Location cannot exceed 200 characters'),
  body('status').optional().isIn(['available', 'in_use', 'maintenance', 'out_of_order', 'allocated', 'retired']).withMessage('Invalid status'),
  body('assignedTo').optional().custom((value) => {
    if (typeof value === 'string' && value.length > 0) {
      return true;
    }
    throw new Error('Invalid assigned user ID');
  }),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date'),
  body('warrantyExpiry').optional().isISO8601().withMessage('Warranty expiry must be a valid date'),
  body('maintenanceSchedule').optional().isISO8601().withMessage('Maintenance schedule must be a valid date'),
  body('notes').optional().trim().isLength({ min: 0, max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], updateResource);

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid resource ID')
], deleteResource);

export default router;
