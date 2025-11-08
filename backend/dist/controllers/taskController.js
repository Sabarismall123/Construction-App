"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksByProject = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTask = exports.getTasks = void 0;
const express_validator_1 = require("express-validator");
const Task_1 = __importDefault(require("../models/Task"));
const getTasks = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, priority, projectId } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (priority) {
            query.priority = priority;
        }
        if (projectId) {
            query.projectId = projectId;
        }
        const tasks = await Task_1.default.find(query)
            .populate('projectId', 'name')
            .populate('assignedTo', 'name email')
            .populate('attachments', 'originalName mimetype size')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Task_1.default.countDocuments(query);
        res.json({
            success: true,
            count: tasks.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: tasks
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
const getTask = async (req, res, next) => {
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
        const task = await Task_1.default.findById(req.params.id)
            .populate('projectId', 'name')
            .populate('assignedTo', 'name email')
            .populate('attachments', 'originalName mimetype size');
        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Task not found'
            });
            return;
        }
        res.json({
            success: true,
            data: task
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTask = getTask;
const createTask = async (req, res, next) => {
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
        const taskData = {
            ...req.body,
            assignedTo: req.body.assignedTo || defaultUserId,
            description: req.body.description || 'No description provided',
            priority: req.body.priority || 'medium',
            status: req.body.status || 'todo',
            estimatedHours: req.body.estimatedHours || 0,
            assignedToName: req.body.assignedTo || 'Unknown User'
        };
        const task = await Task_1.default.create(taskData);
        const populatedTask = await Task_1.default.findById(task._id)
            .populate('projectId', 'name')
            .populate('assignedTo', 'name email');
        res.status(201).json({
            success: true,
            data: populatedTask
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const updateTask = async (req, res, next) => {
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
        const task = await Task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('projectId', 'name')
            .populate('assignedTo', 'name email');
        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Task not found'
            });
            return;
        }
        res.json({
            success: true,
            data: task
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res, next) => {
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
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            res.status(404).json({
                success: false,
                error: 'Task not found'
            });
            return;
        }
        await Task_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
const getTasksByProject = async (req, res, next) => {
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
        const tasks = await Task_1.default.find({ projectId: req.params.projectId })
            .populate('assignedTo', 'name email')
            .populate('attachments', 'originalName mimetype size')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTasksByProject = getTasksByProject;
//# sourceMappingURL=taskController.js.map