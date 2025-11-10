import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Labour from '../models/Labour';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

export const getLabours = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId, isActive } = req.query;
    
    const query: any = {};
    if (projectId) {
      query.projectId = new mongoose.Types.ObjectId(projectId as string);
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const labours = await Labour.find(query)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: labours
    });
  } catch (error) {
    next(error);
  }
};

export const getLabour = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const labour = await Labour.findById(id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email');

    if (!labour) {
      res.status(404).json({
        success: false,
        error: 'Labour not found'
      });
      return;
    }

    res.json({
      success: true,
      data: labour
    });
  } catch (error) {
    next(error);
  }
};

export const createLabour = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const labourData: any = {
      name: req.body.name.trim(),
      mobileNumber: req.body.mobileNumber?.trim(),
      labourType: req.body.labourType?.trim(),
      projectId: req.body.projectId ? new mongoose.Types.ObjectId(req.body.projectId) : undefined,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    // Add createdBy if user is authenticated
    if (req.user && req.user.id) {
      labourData.createdBy = new mongoose.Types.ObjectId(req.user.id);
    }

    const labour = await Labour.create(labourData);
    const populatedLabour = await Labour.findById(labour._id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedLabour
    });
  } catch (error) {
    next(error);
  }
};

export const updateLabour = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const { id } = req.params;
    const updateData: any = {};

    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.mobileNumber !== undefined) updateData.mobileNumber = req.body.mobileNumber?.trim();
    if (req.body.labourType !== undefined) updateData.labourType = req.body.labourType?.trim();
    if (req.body.projectId !== undefined) {
      updateData.projectId = req.body.projectId ? new mongoose.Types.ObjectId(req.body.projectId) : null;
    }
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    const labour = await Labour.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name')
      .populate('createdBy', 'name email');

    if (!labour) {
      res.status(404).json({
        success: false,
        error: 'Labour not found'
      });
      return;
    }

    res.json({
      success: true,
      data: labour
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLabour = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const labour = await Labour.findByIdAndDelete(id);

    if (!labour) {
      res.status(404).json({
        success: false,
        error: 'Labour not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Labour deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getLaboursByProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.params;

    const labours = await Labour.find({
      projectId: new mongoose.Types.ObjectId(projectId),
      isActive: true
    })
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: labours
    });
  } catch (error) {
    next(error);
  }
};

