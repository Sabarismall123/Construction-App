import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import PettyCash from '../models/PettyCash';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all petty cash entries
// @route   GET /api/petty-cash
// @access  Private
export const getPettyCashEntries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, category, projectId, status } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }
    if (projectId) {
      query.projectId = projectId;
    }
    if (status) {
      query.status = status;
    }

    const pettyCashEntries = await PettyCash.find(query)
      .populate('projectId', 'name')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ requestDate: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await PettyCash.countDocuments(query);

    res.json({
      success: true,
      count: pettyCashEntries.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: pettyCashEntries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single petty cash entry
// @route   GET /api/petty-cash/:id
// @access  Private
export const getPettyCashEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const pettyCashEntry = await PettyCash.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!pettyCashEntry) {
      res.status(404).json({
        success: false,
        error: 'Petty cash entry not found'
      });
      return;
    }

    res.json({
      success: true,
      data: pettyCashEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new petty cash entry
// @route   POST /api/petty-cash
// @access  Private
export const createPettyCashEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Map frontend fields to backend format
    // requestedBy should always be the logged-in user's ID (ObjectId), not the paidTo name (string)
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User ID is required. Please ensure you are logged in.'
      });
      return;
    }

    const pettyCashData = {
      projectId: req.body.projectId,
      requestedBy: userId, // Always use logged-in user's ID (ObjectId)
      amount: req.body.amount,
      description: req.body.description || '',
      category: req.body.category || 'other',
      receiptNumber: req.body.receiptNumber || '',
      receiptImage: req.body.attachment || req.body.receiptImage || '',
      status: req.body.status || 'pending',
      requestDate: req.body.date ? new Date(req.body.date) : new Date(),
      notes: req.body.notes || ''
    };

    const pettyCashEntry = await PettyCash.create(pettyCashData);

    const populatedEntry = await PettyCash.findById(pettyCashEntry._id)
      .populate('projectId', 'name')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update petty cash entry
// @route   PUT /api/petty-cash/:id
// @access  Private
export const updatePettyCashEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    // Map frontend fields to backend format
    const updateData: any = {};
    if (req.body.projectId !== undefined) updateData.projectId = req.body.projectId;
    // Only update requestedBy if a valid ObjectId is provided, not a name string
    if (req.body.requestedBy !== undefined && typeof req.body.requestedBy === 'string' && req.body.requestedBy.match(/^[0-9a-fA-F]{24}$/)) {
      updateData.requestedBy = req.body.requestedBy;
    }
    // Do NOT use paidTo (which is a name string) as requestedBy (which must be an ObjectId)
    if (req.body.amount !== undefined) updateData.amount = req.body.amount;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.receiptNumber !== undefined) updateData.receiptNumber = req.body.receiptNumber;
    if (req.body.attachment !== undefined) updateData.receiptImage = req.body.attachment;
    if (req.body.receiptImage !== undefined) updateData.receiptImage = req.body.receiptImage;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.date !== undefined) updateData.requestDate = new Date(req.body.date);
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.approvedBy !== undefined) {
      updateData.approvedBy = req.body.approvedBy;
      if (req.body.status === 'approved') {
        updateData.approvalDate = new Date();
      }
    }
    if (req.body.status === 'reimbursed') {
      updateData.reimbursementDate = new Date();
    }

    const pettyCashEntry = await PettyCash.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
     .populate('requestedBy', 'name email')
     .populate('approvedBy', 'name email');

    if (!pettyCashEntry) {
      res.status(404).json({
        success: false,
        error: 'Petty cash entry not found'
      });
      return;
    }

    res.json({
      success: true,
      data: pettyCashEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete petty cash entry
// @route   DELETE /api/petty-cash/:id
// @access  Private
export const deletePettyCashEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const pettyCashEntry = await PettyCash.findById(req.params.id);

    if (!pettyCashEntry) {
      res.status(404).json({
        success: false,
        error: 'Petty cash entry not found'
      });
      return;
    }

    await PettyCash.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Petty cash entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get petty cash entries by project
// @route   GET /api/petty-cash/project/:projectId
// @access  Private
export const getPettyCashEntriesByProject = async (req: Request, res: Response, next: NextFunction) => {
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

    const pettyCashEntries = await PettyCash.find({ projectId: req.params.projectId })
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      count: pettyCashEntries.length,
      data: pettyCashEntries
    });
  } catch (error) {
    next(error);
  }
};

