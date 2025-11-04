"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStats = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProject = exports.getProjects = void 0;
const express_validator_1 = require("express-validator");
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const Issue_1 = __importDefault(require("../models/Issue"));
const getProjects = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { client: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }
        const projects = await Project_1.default.find(query)
            .populate('projectManager', 'name email')
            .populate('team', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Project_1.default.countDocuments(query);
        res.json({
            success: true,
            count: projects.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: projects
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjects = getProjects;
const getProject = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const project = await Project_1.default.findById(req.params.id)
            .populate('projectManager', 'name email')
            .populate('team', 'name email');
        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found'
            });
            return;
        }
        res.json({
            success: true,
            data: project
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProject = getProject;
const createProject = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const defaultUserId = '68f71938bb60c36e384556f8';
        const projectData = {
            ...req.body,
            projectManager: req.user?._id || defaultUserId,
            location: req.body.location || 'Not specified',
            description: req.body.description || 'No description provided',
            team: req.body.team || []
        };
        const project = await Project_1.default.create(projectData);
        const populatedProject = await Project_1.default.findById(project._id)
            .populate('projectManager', 'name email')
            .populate('team', 'name email');
        res.status(201).json({
            success: true,
            data: populatedProject
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProject = createProject;
const updateProject = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const project = await Project_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('projectManager', 'name email')
            .populate('team', 'name email');
        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found'
            });
            return;
        }
        res.json({
            success: true,
            data: project
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found'
            });
            return;
        }
        const taskCount = await Task_1.default.countDocuments({ projectId: project._id });
        const issueCount = await Issue_1.default.countDocuments({ projectId: project._id });
        if (taskCount > 0 || issueCount > 0) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete project with associated tasks or issues'
            });
            return;
        }
        await Project_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProject = deleteProject;
const getProjectStats = async (req, res, next) => {
    try {
        const totalProjects = await Project_1.default.countDocuments();
        const activeProjects = await Project_1.default.countDocuments({ status: 'in_progress' });
        const completedProjects = await Project_1.default.countDocuments({ status: 'completed' });
        const onHoldProjects = await Project_1.default.countDocuments({ status: 'on_hold' });
        const projectsByStatus = await Project_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const budgetStats = await Project_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalBudget: { $sum: '$budget' },
                    averageBudget: { $avg: '$budget' }
                }
            }
        ]);
        res.json({
            success: true,
            data: {
                totalProjects,
                activeProjects,
                completedProjects,
                onHoldProjects,
                projectsByStatus,
                budgetStats: budgetStats[0] || { totalBudget: 0, averageBudget: 0 }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjectStats = getProjectStats;
//# sourceMappingURL=projectController.js.map