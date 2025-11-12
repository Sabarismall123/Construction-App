import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Issue from '../models/Issue';
import Project from '../models/Project';
import User from '../models/User';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private
export const getIssues = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, priority, projectId, search } = req.query;
    const query: any = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by project
    if (projectId) {
      query.projectId = projectId;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(query)
      .populate('projectId', 'name')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('attachments', 'originalName mimetype size')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      count: issues.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Private
export const getIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const issue = await Issue.findById(req.params.id)
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
  } catch (error) {
    next(error);
  }
};

// @desc    Create new issue
// @route   POST /api/issues
// @access  Public (for testing)
export const createIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    // Create a default user ID for issues created without authentication
    const defaultUserId = '68f71938bb60c36e384556f8'; // Use the test user ID
    
    // Handle assignedTo - allow empty for employees reporting issues
    const assignedTo = req.body.assignedTo && req.body.assignedTo.trim() !== '' 
      ? req.body.assignedTo 
      : null; // Leave empty for employees, manager will assign later
    
    const issueData = {
      ...req.body,
      reportedBy: req.body.reportedBy || defaultUserId, // Use provided user or default
      assignedTo: assignedTo, // Can be null for employees
      description: req.body.description || 'No description provided', // Default description if not provided
      priority: req.body.priority || 'medium', // Default priority
      status: req.body.status || 'open', // Default status
      category: req.body.category || 'other', // Default category
      assignedToName: assignedTo ? (req.body.assignedToName || 'Unknown User') : 'Unassigned', // Store the name for display
      reportedByName: req.body.reportedBy || 'Unknown User' // Store the reporter name
    };

    const issue = await Issue.create(issueData);

    const populatedIssue = await Issue.findById(issue._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populatedIssue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Public (for testing)
export const updateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
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
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Public (for testing)
export const deleteIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
      return;
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issues by project
// @route   GET /api/issues/project/:projectId
// @access  Private
export const getIssuesByProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const issues = await Issue.find({ projectId: req.params.projectId })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('attachments', 'originalName mimetype size')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};
