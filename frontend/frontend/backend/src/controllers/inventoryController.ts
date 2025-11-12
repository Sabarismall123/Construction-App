import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Inventory from '../models/Inventory';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public (for testing)
export const getInventoryItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 100, category, search } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const inventoryItems = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      count: inventoryItems.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: inventoryItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Public (for testing)
export const getInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Public (for testing)
export const createInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const inventoryData = {
      name: req.body.name,
      description: req.body.description || '',
      category: req.body.category,
      currentStock: Number(req.body.currentStock) || 0,
      minThreshold: Number(req.body.minThreshold) || 0,
      maxThreshold: Number(req.body.maxThreshold) || 0,
      unit: req.body.unit || 'pcs',
      unitCost: Number(req.body.unitCost) || 0,
      supplier: req.body.supplier || '',
      location: req.body.location || ''
    };

    const inventoryItem = await Inventory.create(inventoryData);

    res.status(201).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Public (for testing)
export const updateInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Public (for testing)
export const deleteInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const inventoryItem = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventoryItem) {
      res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

