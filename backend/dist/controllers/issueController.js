"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIssuesByProject = exports.deleteIssue = exports.updateIssue = exports.createIssue = exports.getIssue = exports.getIssues = void 0;
const express_validator_1 = require("express-validator");
const Issue_1 = __importDefault(require("../models/Issue"));
const getIssues = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, priority, projectId, search } = req.query;
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
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const issues = await Issue_1.default.find(query)
            .populate('projectId', 'name')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('attachments', 'originalName mimetype size')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Issue_1.default.countDocuments(query);
        res.json({
            success: true,
            count: issues.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: issues
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getIssues = getIssues;
const getIssue = async (req, res, next) => {
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
        const issue = await Issue_1.default.findById(req.params.id)
            .populate('projectId', 'name')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('attachments', 'originalName mimetype size');
        if (!issue) {
            res.status(404).json({
                success: false,
                error: 'Issue not found'
            });
            return;
        }
        res.json({
            success: true,
            data: issue
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getIssue = getIssue;
const createIssue = async (req, res, next) => {
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
        const issueData = {
            ...req.body,
            reportedBy: req.body.reportedBy || defaultUserId,
            assignedTo: req.body.assignedTo || defaultUserId,
            description: req.body.description || 'No description provided',
            priority: req.body.priority || 'medium',
            status: req.body.status || 'open',
            category: req.body.category || 'other',
            assignedToName: req.body.assignedTo || 'Unknown User',
            reportedByName: req.body.reportedBy || 'Unknown User'
        };
        const issue = await Issue_1.default.create(issueData);
        const populatedIssue = await Issue_1.default.findById(issue._id)
            .populate('projectId', 'name')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email');
        res.status(201).json({
            success: true,
            data: populatedIssue
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createIssue = createIssue;
const updateIssue = async (req, res, next) => {
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
        const issue = await Issue_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('projectId', 'name')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email');
        if (!issue) {
            res.status(404).json({
                success: false,
                error: 'Issue not found'
            });
            return;
        }
        res.json({
            success: true,
            data: issue
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateIssue = updateIssue;
const deleteIssue = async (req, res, next) => {
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
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({
                success: false,
                error: 'Issue not found'
            });
            return;
        }
        await Issue_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Issue deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteIssue = deleteIssue;
const getIssuesByProject = async (req, res, next) => {
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
        const issues = await Issue_1.default.find({ projectId: req.params.projectId })
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('attachments', 'originalName mimetype size')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: issues.length,
            data: issues
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getIssuesByProject = getIssuesByProject;
//# sourceMappingURL=issueController.js.map