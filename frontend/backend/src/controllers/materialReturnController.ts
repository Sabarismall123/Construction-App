import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import MaterialReturn from '../models/MaterialReturn';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

const defaultUserId = '68f71938bb60c36e384556f8';

// @desc    Get all material returns
// @route   GET /api/material-returns
// @access  Public (for testing)
export const getMaterialReturns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, projectId } = req.query;
    const query: any = {};

    if (projectId) {
      query.projectId = projectId;
    }

    const materialReturns = await MaterialReturn.find(query)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('returnedBy', 'name email')
      .sort({ returnDate: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await MaterialReturn.countDocuments(query);

    res.json({
      success: true,
      count: materialReturns.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: materialReturns
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material return
// @route   GET /api/material-returns/:id
// @access  Public (for testing)
export const getMaterialReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialReturn = await MaterialReturn.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('returnedBy', 'name email');

    if (!materialReturn) {
      res.status(404).json({
        success: false,
        error: 'Material return not found'
      });
      return;
    }

    res.json({
      success: true,
      data: materialReturn
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new material return
// @route   POST /api/material-returns
// @access  Public (for testing)
export const createMaterialReturn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const returnData = {
      projectId: req.body.projectId,
      taskId: req.body.taskId || undefined,
      materialId: req.body.materialId,
      quantity: Number(req.body.quantity),
      returnDate: req.body.returnDate ? new Date(req.body.returnDate) : new Date(),
      returnedBy: req.user?._id || new mongoose.Types.ObjectId(defaultUserId),
      receivedBy: req.body.receivedBy,
      condition: req.body.condition || 'good',
      notes: req.body.notes || ''
    };

    const materialReturn = await MaterialReturn.create(returnData);

    const populatedReturn = await MaterialReturn.findById(materialReturn._id)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('returnedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReturn
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update material return
// @route   PUT /api/material-returns/:id
// @access  Public (for testing)
export const updateMaterialReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialReturn = await MaterialReturn.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('returnedBy', 'name email');

    if (!materialReturn) {
      res.status(404).json({
        success: false,
        error: 'Material return not found'
      });
      return;
    }

    res.json({
      success: true,
      data: materialReturn
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material return
// @route   DELETE /api/material-returns/:id
// @access  Public (for testing)
export const deleteMaterialReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialReturn = await MaterialReturn.findByIdAndDelete(req.params.id);

    if (!materialReturn) {
      res.status(404).json({
        success: false,
        error: 'Material return not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Material return deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

