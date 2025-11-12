import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Task from '../models/Task';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, priority, projectId } = req.query;
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

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email')
      .populate('attachments', 'originalName mimetype size')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      count: tasks.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const task = await Task.findById(req.params.id)
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
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin, Manager, Site Supervisor)
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Validate assignedTo is a valid MongoDB ObjectId
    let assignedToId = req.body.assignedTo;
    if (assignedToId && typeof assignedToId === 'string') {
      // Check if it's a valid ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(assignedToId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid assigned user ID - must be a valid MongoDB ObjectId'
        });
        return;
      }
      // Convert to ObjectId
      assignedToId = new mongoose.Types.ObjectId(assignedToId);
    } else if (!assignedToId) {
      // If no user assigned, use default or require it
      res.status(400).json({
        success: false,
        error: 'Assigned user is required'
      });
      return;
    }
    
    // Get user name for display
    let assignedToName = 'Unknown User';
    try {
      const User = mongoose.model('User');
      const assignedUser = await User.findById(assignedToId).select('name email');
      if (assignedUser) {
        assignedToName = assignedUser.name || assignedUser.email || 'Unknown User';
      }
    } catch (error) {
      console.warn('Could not fetch user name for assignedTo:', error);
    }
    
    // Get creator information (from request user if available, or from req.body)
    let createdById = null;
    let createdByName = 'System';
    let createdByRole = 'system';
    
    if (req.user && req.user.id) {
      // If user is authenticated, use their info
      createdById = new mongoose.Types.ObjectId(req.user.id);
      createdByName = req.user.name || 'Unknown User';
      createdByRole = req.user.role || 'user';
    } else if (req.body.createdBy) {
      // If createdBy is provided in body, use it
      try {
        const User = mongoose.model('User');
        const creator = await User.findById(req.body.createdBy).select('name email role');
        if (creator) {
          createdById = new mongoose.Types.ObjectId(req.body.createdBy);
          createdByName = creator.name || creator.email || 'Unknown User';
          createdByRole = creator.role || 'user';
        }
      } catch (error) {
        console.warn('Could not fetch creator user:', error);
      }
    }
    
    const taskData = {
      ...req.body,
      assignedTo: assignedToId, // Use validated ObjectId
      description: req.body.description || 'No description provided', // Default description if not provided
      priority: req.body.priority || 'medium', // Default priority
      status: req.body.status || 'todo', // Default status
      estimatedHours: req.body.estimatedHours || 0, // Default hours
      assignedToName: assignedToName, // Store the name for display
      createdBy: createdById, // Store creator ID
      createdByName: createdByName, // Store creator name
      createdByRole: createdByRole // Store creator role
    };

    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Admin, Manager, Site Supervisor)
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
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
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Manager, Site Supervisor)
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasksByProject = async (req: Request, res: Response, next: NextFunction) => {
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

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('attachments', 'originalName mimetype size')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};
