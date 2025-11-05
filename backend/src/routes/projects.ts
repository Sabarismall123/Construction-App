import express from 'express';
import { body, param } from 'express-validator';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public (for testing)
router.get('/', getProjects);

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get('/stats', protect, getProjectStats);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid project ID')
], getProject);

// @route   POST /api/projects
// @desc    Create new project
// @access  Public (for testing)
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Project name must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ min: 0, max: 500 }).withMessage('Description must be less than 500 characters'),
  body('client').trim().isLength({ min: 1, max: 100 }).withMessage('Client name must be between 1 and 100 characters'),
  body('location').optional().trim().isLength({ min: 0, max: 200 }).withMessage('Location must be less than 200 characters'),
  body('startDate').custom((value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }).withMessage('Start date must be a valid date'),
  body('endDate').custom((value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }).withMessage('End date must be a valid date'),
  body('budget').custom((value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }).withMessage('Budget must be a valid number'),
  body('status').optional().isIn(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled', 'active']).withMessage('Invalid status'),
  body('projectManager').optional().isMongoId().withMessage('Invalid project manager ID')
], createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin, Manager)
router.put('/:id', protect, authorize('admin', 'manager'), [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('client').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Client name must be between 2 and 100 characters'),
  body('location').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('projectManager').optional().isMongoId().withMessage('Invalid project manager ID')
], updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin, Manager)
router.delete('/:id', protect, authorize('admin', 'manager'), [
  param('id').isMongoId().withMessage('Invalid project ID')
], deleteProject);

export default router;
