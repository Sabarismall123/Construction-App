import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Resource from '../models/Resource';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
export const getResources = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, type, status, projectId } = req.query;
    const query: any = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by project
    if (projectId) {
      query.projectId = projectId;
    }

    const resources = await Resource.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      count: resources.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
export const getResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const resource = await Resource.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email');

    if (!resource) {
      res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
      return;
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin, Manager, Site Supervisor)
export const createResource = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Map frontend fields to backend model
    const resourceData = {
      name: req.body.name,
      type: req.body.type === 'labor' ? 'other' : req.body.type, // Map labor to other, or keep as is
      category: req.body.category || req.body.type || 'general',
      description: req.body.description || '',
      quantity: req.body.quantity || 0,
      unit: req.body.unit || 'unit',
      costPerUnit: req.body.costPerUnit || req.body.cost || 0,
      supplier: req.body.supplier || '',
      location: req.body.location || '',
      status: req.body.status || 'available',
      assignedTo: req.body.assignedTo || undefined,
      projectId: req.body.projectId || undefined,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date(),
      warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined,
      maintenanceSchedule: req.body.maintenanceSchedule ? new Date(req.body.maintenanceSchedule) : undefined,
      notes: req.body.notes || ''
    };

    const resource = await Resource.create(resourceData);

    const populatedResource = await Resource.findById(resource._id)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populatedResource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin, Manager, Site Supervisor)
export const updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    // Map frontend fields to backend model
    const updateData: any = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.type !== undefined) {
      updateData.type = req.body.type === 'labor' ? 'other' : req.body.type;
    }
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity;
    if (req.body.unit !== undefined) updateData.unit = req.body.unit;
    if (req.body.costPerUnit !== undefined || req.body.cost !== undefined) {
      updateData.costPerUnit = req.body.costPerUnit || req.body.cost;
    }
    if (req.body.supplier !== undefined) updateData.supplier = req.body.supplier;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.assignedTo !== undefined) updateData.assignedTo = req.body.assignedTo;
    if (req.body.projectId !== undefined) updateData.projectId = req.body.projectId;
    if (req.body.purchaseDate !== undefined) updateData.purchaseDate = new Date(req.body.purchaseDate);
    if (req.body.warrantyExpiry !== undefined) {
      updateData.warrantyExpiry = req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : null;
    }
    if (req.body.maintenanceSchedule !== undefined) {
      updateData.maintenanceSchedule = req.body.maintenanceSchedule ? new Date(req.body.maintenanceSchedule) : null;
    }
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
     .populate('assignedTo', 'name email');

    if (!resource) {
      res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
      return;
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin, Manager, Site Supervisor)
export const deleteResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
      return;
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resources by project
// @route   GET /api/resources/project/:projectId
// @access  Private
export const getResourcesByProject = async (req: Request, res: Response, next: NextFunction) => {
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

    const resources = await Resource.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

