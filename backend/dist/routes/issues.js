"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const issueController_1 = require("../controllers/issueController");
const router = express_1.default.Router();
router.get('/', issueController_1.getIssues);
router.get('/project/:projectId', [
    (0, express_validator_1.param)('projectId').isMongoId().withMessage('Invalid project ID')
], issueController_1.getIssuesByProject);
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid issue ID')
], issueController_1.getIssue);
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
    (0, express_validator_1.body)('reportedBy').optional().custom((value) => {
        if (typeof value === 'string' && value.length > 0) {
            return true;
        }
        throw new Error('Invalid reported by user ID');
    }),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], issueController_1.createIssue);
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid issue ID'),
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 2, max: 1000 }).withMessage('Description must be between 2 and 1000 characters'),
    (0, express_validator_1.body)('assignedTo').optional().custom((value) => {
        if (typeof value === 'string' && value.length > 0) {
            return true;
        }
        throw new Error('Invalid assigned user ID');
    }),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], issueController_1.updateIssue);
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid issue ID')
], issueController_1.deleteIssue);
exports.default = router;
//# sourceMappingURL=issues.js.map