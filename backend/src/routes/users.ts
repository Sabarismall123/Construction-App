import express from 'express';
import { body, param } from 'express-validator';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Public (for testing)
router.get('/', getUsers);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Public (for testing)
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'site_supervisor', 'employee']).withMessage('Invalid role'),
  body('avatar').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(['admin', 'manager', 'site_supervisor', 'employee']).withMessage('Invalid role'),
  body('avatar').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], deleteUser);

export default router;
