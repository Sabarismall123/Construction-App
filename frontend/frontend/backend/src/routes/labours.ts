import express, { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createLabour, getLabours, getLabour, updateLabour, deleteLabour, getLaboursByProject } from '../controllers/labourController';
import { protect } from '../middleware/auth';

const router: Router = express.Router();

// All routes require authentication
router.use(protect);

// Get all labours
router.get('/', getLabours);

// Get labour by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid labour ID')
], getLabour);

// Create new labour
router.post('/', [
  body('name').notEmpty().trim().withMessage('Labour name is required'),
  body('mobileNumber').optional().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
  body('labourType').optional().trim(),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], createLabour);

// Update labour
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid labour ID'),
  body('name').optional().trim(),
  body('mobileNumber').optional().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
  body('labourType').optional().trim(),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], updateLabour);

// Delete labour
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid labour ID')
], deleteLabour);

// Get labours by project
router.get('/project/:projectId', [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], getLaboursByProject);

export default router;

