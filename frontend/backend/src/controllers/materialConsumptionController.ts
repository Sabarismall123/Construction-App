import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import MaterialConsumption from '../models/MaterialConsumption';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

const defaultUserId = '68f71938bb60c36e384556f8';

// @desc    Get all material consumptions
// @route   GET /api/material-consumptions
// @access  Public (for testing)
export const getMaterialConsumptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, projectId } = req.query;
    const query: any = {};

    if (projectId) {
      query.projectId = projectId;
    }

    const materialConsumptions = await MaterialConsumption.find(query)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('recordedBy', 'name email')
      .sort({ consumptionDate: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await MaterialConsumption.countDocuments(query);

    res.json({
      success: true,
      count: materialConsumptions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: materialConsumptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material consumption
// @route   GET /api/material-consumptions/:id
// @access  Public (for testing)
export const getMaterialConsumption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialConsumption = await MaterialConsumption.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('recordedBy', 'name email');

    if (!materialConsumption) {
      res.status(404).json({
        success: false,
        error: 'Material consumption not found'
      });
      return;
    }

    res.json({
      success: true,
      data: materialConsumption
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new material consumption
// @route   POST /api/material-consumptions
// @access  Public (for testing)
export const createMaterialConsumption = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const consumptionData = {
      projectId: req.body.projectId,
      taskId: req.body.taskId || undefined,
      materialId: req.body.materialId,
      quantity: Number(req.body.quantity),
      consumptionDate: req.body.consumptionDate ? new Date(req.body.consumptionDate) : new Date(),
      recordedBy: req.user?._id || new mongoose.Types.ObjectId(defaultUserId),
      notes: req.body.notes || ''
    };

    const materialConsumption = await MaterialConsumption.create(consumptionData);

    const populatedConsumption = await MaterialConsumption.findById(materialConsumption._id)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('recordedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedConsumption
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update material consumption
// @route   PUT /api/material-consumptions/:id
// @access  Public (for testing)
export const updateMaterialConsumption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialConsumption = await MaterialConsumption.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .populate('materialId', 'name unit')
      .populate('recordedBy', 'name email');

    if (!materialConsumption) {
      res.status(404).json({
        success: false,
        error: 'Material consumption not found'
      });
      return;
    }

    res.json({
      success: true,
      data: materialConsumption
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material consumption
// @route   DELETE /api/material-consumptions/:id
// @access  Public (for testing)
export const deleteMaterialConsumption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const materialConsumption = await MaterialConsumption.findByIdAndDelete(req.params.id);

    if (!materialConsumption) {
      res.status(404).json({
        success: false,
        error: 'Material consumption not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Material consumption deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

