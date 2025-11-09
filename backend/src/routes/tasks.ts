import express from 'express';
import { body, param } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject
} from '../controllers/taskController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Public (for testing)
router.get('/', getTasks);

// @route   GET /api/tasks/project/:projectId
// @desc    Get tasks by project
// @access  Private
router.get('/project/:projectId', protect, [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], getTasksByProject);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid task ID')
], getTask);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Public (for testing)
router.post('/', [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ min: 2, max: 1000 }).withMessage('Description must be between 2 and 1000 characters'),
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required').custom((value) => {
    // Check if it's a valid MongoDB ObjectId
    if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
      return true;
    }
    throw new Error('Invalid assigned user ID - must be a valid MongoDB ObjectId');
  }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
], createTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Admin, Manager, Site Supervisor)
router.put('/:id', protect, authorize('admin', 'manager', 'site_supervisor'), [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'completed']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number'),
  body('actualHours').optional().isNumeric().withMessage('Actual hours must be a number')
], updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Public (for testing) - Change to Private in production
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid task ID')
], deleteTask);

export default router;
