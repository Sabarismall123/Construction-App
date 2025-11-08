"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', taskController_1.getTasks);
router.get('/project/:projectId', auth_1.protect, [
    (0, express_validator_1.param)('projectId').isMongoId().withMessage('Invalid project ID')
], taskController_1.getTasksByProject);
router.get('/:id', auth_1.protect, [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid task ID')
], taskController_1.getTask);
router.post('/', [
    (0, express_validator_1.body)('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 2, max: 1000 }).withMessage('Description must be between 2 and 1000 characters'),
    (0, express_validator_1.body)('projectId').isMongoId().withMessage('Invalid project ID'),
    (0, express_validator_1.body)('assignedTo').optional().custom((value) => {
        if (typeof value === 'string' && value.length > 0) {
            return true;
        }
        throw new Error('Invalid assigned user ID');
    }),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('dueDate').isISO8601().withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
], taskController_1.createTask);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager', 'site_supervisor'), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid task ID'),
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('status').optional().isIn(['todo', 'in_progress', 'review', 'completed']).withMessage('Invalid status'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number'),
    (0, express_validator_1.body)('actualHours').optional().isNumeric().withMessage('Actual hours must be a number')
], taskController_1.updateTask);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager', 'site_supervisor'), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid task ID')
], taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map