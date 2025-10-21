import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Attendance from '../models/Attendance';
import Project from '../models/Project';
import User from '../models/User';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Public (for testing)
export const getAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, projectId, employeeName, search, date } = req.query;
    const query: any = {};

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (employeeName) query.employeeName = { $regex: employeeName, $options: 'i' };
    if (date) {
      const searchDate = new Date(date as string);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { labourType: { $regex: search, $options: 'i' } }
      ];
    }

    const attendance = await Attendance.find(query)
      .populate('projectId', 'name')
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      count: attendance.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Public (for testing)
export const getAttendanceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const attendance = await Attendance.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name email');

    if (!attendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
      return;
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new attendance/labor record
// @route   POST /api/attendance
// @access  Public (for testing)
export const createAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Get project name for display
    const project = await Project.findById(req.body.projectId);
    const projectName = project ? project.name : 'Unknown Project';

    const attendanceData = {
      ...req.body,
      projectName: projectName,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      status: req.body.status || 'present',
      hours: req.body.hours || 0,
      isApproved: false
    };

    const attendance = await Attendance.create(attendanceData);

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('projectId', 'name')
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedAttendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Public (for testing)
export const updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    // If projectId is being updated, get the new project name
    if (req.body.projectId) {
      const project = await Project.findById(req.body.projectId);
      if (project) {
        req.body.projectName = project.name;
      }
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
     .populate('employeeId', 'name email')
     .populate('approvedBy', 'name email');

    if (!attendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
      return;
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Public (for testing)
export const deleteAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
      return;
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records by project
// @route   GET /api/attendance/project/:projectId
// @access  Public (for testing)
export const getAttendanceByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const attendance = await Attendance.find({ projectId: req.params.projectId })
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};
