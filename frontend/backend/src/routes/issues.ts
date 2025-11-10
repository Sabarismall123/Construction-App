import express from 'express';
import { body, param } from 'express-validator';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssuesByProject
} from '../controllers/issueController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/issues
// @desc    Get all issues
// @access  Public (for testing)
router.get('/', getIssues);

// @route   GET /api/issues/project/:projectId
// @desc    Get issues by project
// @access  Public (for testing)
router.get('/project/:projectId', [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], getIssuesByProject);

// @route   GET /api/issues/:id
// @desc    Get single issue
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid issue ID')
], getIssue);

// @route   POST /api/issues
// @desc    Create new issue
// @access  Public (for testing)
router.post('/', [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ min: 2, max: 1000 }).withMessage('Description must be between 2 and 1000 characters'),
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('assignedTo').optional().custom((value) => {
    // Allow empty string, null, undefined, or valid string values
    if (value === undefined || value === null || value === '') {
      return true; // Empty is allowed for employees reporting issues
    }
    // If provided, must be a non-empty string
    if (typeof value === 'string' && value.length > 0) {
      return true;
    }
    throw new Error('Invalid assigned user ID');
  }),
  body('reportedBy').optional().custom((value) => {
    // Allow string values like "sabari" or valid MongoDB ObjectIds
    if (typeof value === 'string' && value.length > 0) {
      return true;
    }
    throw new Error('Invalid reported by user ID');
  }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], createIssue);

// @route   PUT /api/issues/:id
// @desc    Update issue
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid issue ID'),
  body('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ min: 2, max: 1000 }).withMessage('Description must be between 2 and 1000 characters'),
  body('assignedTo').optional().custom((value) => {
    if (typeof value === 'string' && value.length > 0) {
      return true;
    }
    throw new Error('Invalid assigned user ID');
  }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], updateIssue);

// @route   DELETE /api/issues/:id
// @desc    Delete issue
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid issue ID')
], deleteIssue);

export default router;
