import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import SiteTransfer from '../models/SiteTransfer';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

const defaultUserId = '68f71938bb60c36e384556f8';

// @desc    Get all site transfers
// @route   GET /api/site-transfers
// @access  Public (for testing)
export const getSiteTransfers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, fromProjectId, toProjectId } = req.query;
    const query: any = {};

    if (fromProjectId) {
      query.fromProjectId = fromProjectId;
    }
    if (toProjectId) {
      query.toProjectId = toProjectId;
    }

    const siteTransfers = await SiteTransfer.find(query)
      .populate('fromProjectId', 'name')
      .populate('toProjectId', 'name')
      .populate('materialId', 'name unit')
      .populate('transferredBy', 'name email')
      .sort({ transferDate: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await SiteTransfer.countDocuments(query);

    res.json({
      success: true,
      count: siteTransfers.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: siteTransfers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single site transfer
// @route   GET /api/site-transfers/:id
// @access  Public (for testing)
export const getSiteTransfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteTransfer = await SiteTransfer.findById(req.params.id)
      .populate('fromProjectId', 'name')
      .populate('toProjectId', 'name')
      .populate('materialId', 'name unit')
      .populate('transferredBy', 'name email');

    if (!siteTransfer) {
      res.status(404).json({
        success: false,
        error: 'Site transfer not found'
      });
      return;
    }

    res.json({
      success: true,
      data: siteTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new site transfer
// @route   POST /api/site-transfers
// @access  Public (for testing)
export const createSiteTransfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const userId = req.user?._id || req.user?.id || defaultUserId;

    const siteTransferData = {
      ...req.body,
      transferredBy: userId,
      transferDate: req.body.transferDate ? new Date(req.body.transferDate) : new Date()
    };

    const siteTransfer = await SiteTransfer.create(siteTransferData);

    const populatedTransfer = await SiteTransfer.findById(siteTransfer._id)
      .populate('fromProjectId', 'name')
      .populate('toProjectId', 'name')
      .populate('materialId', 'name unit')
      .populate('transferredBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update site transfer
// @route   PUT /api/site-transfers/:id
// @access  Public (for testing)
export const updateSiteTransfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const updateData: any = { ...req.body };
    if (updateData.transferDate) {
      updateData.transferDate = new Date(updateData.transferDate);
    }

    const siteTransfer = await SiteTransfer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('fromProjectId', 'name')
      .populate('toProjectId', 'name')
      .populate('materialId', 'name unit')
      .populate('transferredBy', 'name email');

    if (!siteTransfer) {
      res.status(404).json({
        success: false,
        error: 'Site transfer not found'
      });
      return;
    }

    res.json({
      success: true,
      data: siteTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete site transfer
// @route   DELETE /api/site-transfers/:id
// @access  Public (for testing)
export const deleteSiteTransfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteTransfer = await SiteTransfer.findByIdAndDelete(req.params.id);

    if (!siteTransfer) {
      res.status(404).json({
        success: false,
        error: 'Site transfer not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Site transfer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

