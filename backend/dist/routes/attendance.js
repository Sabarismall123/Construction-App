"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const attendanceController_1 = require("../controllers/attendanceController");
const router = express_1.default.Router();
router.get('/', attendanceController_1.getAttendance);
router.get('/project/:projectId', [
    (0, express_validator_1.param)('projectId').isMongoId().withMessage('Invalid project ID')
], attendanceController_1.getAttendanceByProject);
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid attendance ID')
], attendanceController_1.getAttendanceRecord);
router.post('/', [
    (0, express_validator_1.body)('employeeName').trim().isLength({ min: 2, max: 100 }).withMessage('Employee/Labor name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('mobileNumber').optional().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
    (0, express_validator_1.body)('projectId').isMongoId().withMessage('Invalid project ID'),
    (0, express_validator_1.body)('labourType').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Labour type must be between 2 and 50 characters'),
    (0, express_validator_1.body)('date').optional().isISO8601().withMessage('Date must be a valid date'),
    (0, express_validator_1.body)('timeIn').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time in must be in HH:MM format'),
    (0, express_validator_1.body)('timeOut').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time out must be in HH:MM format'),
    (0, express_validator_1.body)('status').optional().isIn(['present', 'absent', 'late', 'half_day', 'overtime']).withMessage('Invalid status'),
    (0, express_validator_1.body)('hours').optional().isNumeric().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ min: 2, max: 500 }).withMessage('Notes must be between 2 and 500 characters')
], attendanceController_1.createAttendance);
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid attendance ID'),
    (0, express_validator_1.body)('employeeName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Employee/Labor name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('mobileNumber').optional().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
    (0, express_validator_1.body)('labourType').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Labour type must be between 2 and 50 characters'),
    (0, express_validator_1.body)('date').optional().isISO8601().withMessage('Date must be a valid date'),
    (0, express_validator_1.body)('timeIn').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time in must be in HH:MM format'),
    (0, express_validator_1.body)('timeOut').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time out must be in HH:MM format'),
    (0, express_validator_1.body)('status').optional().isIn(['present', 'absent', 'late', 'half_day', 'overtime']).withMessage('Invalid status'),
    (0, express_validator_1.body)('hours').optional().isNumeric().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ min: 2, max: 500 }).withMessage('Notes must be between 2 and 500 characters')
], attendanceController_1.updateAttendance);
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid attendance ID')
], attendanceController_1.deleteAttendance);
exports.default = router;
//# sourceMappingURL=attendance.js.map