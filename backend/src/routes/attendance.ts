import express from 'express';
import { body, param } from 'express-validator';
import {
  getAttendance,
  getAttendanceRecord,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByProject
} from '../controllers/attendanceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get all attendance records
// @access  Public (for testing)
router.get('/', getAttendance);

// @route   GET /api/attendance/project/:projectId
// @desc    Get attendance records by project
// @access  Public (for testing)
router.get('/project/:projectId', [
  param('projectId').isMongoId().withMessage('Invalid project ID')
], getAttendanceByProject);

// @route   GET /api/attendance/:id
// @desc    Get single attendance record
// @access  Public (for testing)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid attendance ID')
], getAttendanceRecord);

// @route   POST /api/attendance
// @desc    Create new attendance/labor record
// @access  Public (for testing)
router.post('/', [
  body('employeeName').trim().isLength({ min: 2, max: 100 }).withMessage('Employee/Labor name must be between 2 and 100 characters'),
  body('mobileNumber').optional({ nullable: true, checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('labourType').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2, max: 50 }).withMessage('Labour type must be between 2 and 50 characters'),
  body('date').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Date must be a valid date'),
  body('timeIn').optional({ nullable: true, checkFalsy: true }).matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time in must be in HH:MM format'),
  body('timeOut').optional({ nullable: true, checkFalsy: true }).matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time out must be in HH:MM format'),
  body('status').optional({ nullable: true, checkFalsy: true }).isIn(['present', 'absent', 'late', 'half_day', 'overtime']).withMessage('Invalid status'),
  body('hours').optional({ nullable: true, checkFalsy: true }).isNumeric().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('notes').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2, max: 500 }).withMessage('Notes must be between 2 and 500 characters'),
  body('attachments').optional({ nullable: true, checkFalsy: true }).isArray().withMessage('Attachments must be an array'),
  body('attachments.*').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Each attachment must be a valid MongoDB ObjectId')
], createAttendance);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Public (for testing)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid attendance ID'),
  body('employeeName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Employee/Labor name must be between 2 and 100 characters'),
  body('mobileNumber').optional().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
  body('labourType').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Labour type must be between 2 and 50 characters'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('timeIn').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time in must be in HH:MM format'),
  body('timeOut').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time out must be in HH:MM format'),
  body('status').optional().isIn(['present', 'absent', 'late', 'half_day', 'overtime']).withMessage('Invalid status'),
  body('hours').optional().isNumeric().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('notes').optional().trim().isLength({ min: 2, max: 500 }).withMessage('Notes must be between 2 and 500 characters'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  body('attachments.*').optional().isMongoId().withMessage('Each attachment must be a valid MongoDB ObjectId')
], updateAttendance);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Public (for testing)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid attendance ID')
], deleteAttendance);

export default router;