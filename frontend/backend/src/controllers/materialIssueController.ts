import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import MaterialIssue from '../models/MaterialIssue';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

const defaultUserId = '68f71938bb60c36e384556f8';

// @desc    Get all material issues
// @route   GET /api/material-issues
// @access  Public (for testing)
export const getMaterialIssues = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, projectId } = req.query;
    const query: any = {};

    if (projectId) {
      query.projectId = projectId;
    }

    const materialIssues = await MaterialIssue.find(query)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('issuedBy', 'name email')
      .sort({ issuedDate: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await MaterialIssue.countDocuments(query);

    res.json({
      success: true,
      count: materialIssues.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: materialIssues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material issue
// @route   GET /api/material-issues/:id
// @access  Public (for testing)
export const getMaterialIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialIssue = await MaterialIssue.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('issuedBy', 'name email');

    if (!materialIssue) {
      res.status(404).json({
        success: false,
        error: 'Material issue not found'
      });
      return;
    }

    res.json({
      success: true,
      data: materialIssue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new material issue
// @route   POST /api/material-issues
// @access  Public (for testing)
export const createMaterialIssue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const issueData = {
      projectId: req.body.projectId,
      taskId: req.body.taskId || undefined,
      materialId: req.body.materialId,
      quantity: Number(req.body.quantity),
      issuedDate: req.body.issuedDate ? new Date(req.body.issuedDate) : new Date(),
      issuedBy: req.user?._id || new mongoose.Types.ObjectId(defaultUserId),
      issuedTo: req.body.issuedTo,
      notes: req.body.notes || ''
    };

    const materialIssue = await MaterialIssue.create(issueData);

    const populatedIssue = await MaterialIssue.findById(materialIssue._id)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('issuedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedIssue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update material issue
// @route   PUT /api/material-issues/:id
// @access  Public (for testing)
export const updateMaterialIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialIssue = await MaterialIssue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('issuedBy', 'name email');

    if (!materialIssue) {
      res.status(404).json({
        success: false,
        error: 'Material issue not found'
      });
      return;
    }

    res.json({
      success: true,
      data: materialIssue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material issue
// @route   DELETE /api/material-issues/:id
// @access  Public (for testing)
export const deleteMaterialIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialIssue = await MaterialIssue.findByIdAndDelete(req.params.id);

    if (!materialIssue) {
      res.status(404).json({
        success: false,
        error: 'Material issue not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Material issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

