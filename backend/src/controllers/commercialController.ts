import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Commercial from '../models/Commercial';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all commercial entries
// @route   GET /api/commercial
// @access  Private
export const getCommercialEntries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, type, status, projectId } = req.query;
    const query: any = {};

    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    if (projectId) {
      query.projectId = projectId;
    }

    const commercialEntries = await Commercial.find(query)
      .populate('projectId', 'name')
      .sort({ date: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Commercial.countDocuments(query);

    res.json({
      success: true,
      count: commercialEntries.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: commercialEntries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single commercial entry
// @route   GET /api/commercial/:id
// @access  Private
export const getCommercialEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const commercialEntry = await Commercial.findById(req.params.id)
      .populate('projectId', 'name');

    if (!commercialEntry) {
      res.status(404).json({
        success: false,
        error: 'Commercial entry not found'
      });
      return;
    }

    res.json({
      success: true,
      data: commercialEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new commercial entry
// @route   POST /api/commercial
// @access  Private
export const createCommercialEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const commercialData = {
      projectId: req.body.projectId,
      type: req.body.type || 'other',
      date: req.body.date ? new Date(req.body.date) : new Date(),
      amount: req.body.amount || 0,
      description: req.body.description || '',
      vendor: req.body.vendor || '',
      invoiceNumber: req.body.invoiceNumber || '',
      status: req.body.status || 'pending',
      relatedTo: req.body.relatedTo || '',
      attachments: req.body.attachments || [],
      notes: req.body.notes || ''
    };

    const commercialEntry = await Commercial.create(commercialData);

    const populatedEntry = await Commercial.findById(commercialEntry._id)
      .populate('projectId', 'name');

    res.status(201).json({
      success: true,
      data: populatedEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update commercial entry
// @route   PUT /api/commercial/:id
// @access  Private
export const updateCommercialEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const updateData: any = {};
    if (req.body.projectId !== undefined) updateData.projectId = req.body.projectId;
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.date !== undefined) updateData.date = new Date(req.body.date);
    if (req.body.amount !== undefined) updateData.amount = req.body.amount;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.vendor !== undefined) updateData.vendor = req.body.vendor;
    if (req.body.invoiceNumber !== undefined) updateData.invoiceNumber = req.body.invoiceNumber;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.relatedTo !== undefined) updateData.relatedTo = req.body.relatedTo;
    if (req.body.attachments !== undefined) updateData.attachments = req.body.attachments;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;

    const commercialEntry = await Commercial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('projectId', 'name');

    if (!commercialEntry) {
      res.status(404).json({
        success: false,
        error: 'Commercial entry not found'
      });
      return;
    }

    res.json({
      success: true,
      data: commercialEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete commercial entry
// @route   DELETE /api/commercial/:id
// @access  Private
export const deleteCommercialEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const commercialEntry = await Commercial.findById(req.params.id);

    if (!commercialEntry) {
      res.status(404).json({
        success: false,
        error: 'Commercial entry not found'
      });
      return;
    }

    await Commercial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Commercial entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get commercial entries by project
// @route   GET /api/commercial/project/:projectId
// @access  Private
export const getCommercialEntriesByProject = async (req: Request, res: Response, next: NextFunction) => {
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

    const commercialEntries = await Commercial.find({ projectId: req.params.projectId })
      .sort({ date: -1 });

    res.json({
      success: true,
      count: commercialEntries.length,
      data: commercialEntries
    });
  } catch (error) {
    next(error);
  }
};

