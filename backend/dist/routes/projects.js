"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const projectController_1 = require("../controllers/projectController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', projectController_1.getProjects);
router.get('/stats', auth_1.protect, projectController_1.getProjectStats);
router.get('/:id', auth_1.protect, [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid project ID')
], projectController_1.getProject);
router.post('/', [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 2, max: 500 }).withMessage('Description must be between 2 and 500 characters'),
    (0, express_validator_1.body)('client').trim().isLength({ min: 2, max: 100 }).withMessage('Client name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('location').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
    (0, express_validator_1.body)('startDate').isISO8601().withMessage('Start date must be a valid date'),
    (0, express_validator_1.body)('endDate').isISO8601().withMessage('End date must be a valid date'),
    (0, express_validator_1.body)('budget').isNumeric().withMessage('Budget must be a number'),
    (0, express_validator_1.body)('projectManager').optional().isMongoId().withMessage('Invalid project manager ID')
], projectController_1.createProject);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid project ID'),
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    (0, express_validator_1.body)('client').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Client name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('location').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
    (0, express_validator_1.body)('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    (0, express_validator_1.body)('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    (0, express_validator_1.body)('budget').optional().isNumeric().withMessage('Budget must be a number'),
    (0, express_validator_1.body)('projectManager').optional().isMongoId().withMessage('Invalid project manager ID')
], projectController_1.updateProject);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid project ID')
], projectController_1.deleteProject);
exports.default = router;
//# sourceMappingURL=projects.js.map