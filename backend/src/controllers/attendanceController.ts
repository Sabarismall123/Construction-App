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
      .populate('attachments') // Populate attachments to include file details
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
      .populate('approvedBy', 'name email')
      .populate('attachments'); // Populate attachments to include file details

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
      console.error('❌ Validation errors:', errors.array());
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

    const attendanceDate = req.body.date ? new Date(req.body.date) : new Date();
    // Normalize date to start of day for comparison
    const normalizedDate = new Date(attendanceDate);
    normalizedDate.setHours(0, 0, 0, 0);

    // Check for duplicate attendance record
    // For labour records (no employeeId), check by employeeName + mobileNumber + date + projectId
    // For employee records (with employeeId), check by employeeId + date
    const duplicateQuery: any = {
      date: {
        $gte: new Date(normalizedDate),
        $lt: new Date(new Date(normalizedDate).setDate(normalizedDate.getDate() + 1))
      }
    };

    if (req.body.employeeId) {
      // Employee record - check by employeeId + date
      duplicateQuery.employeeId = new mongoose.Types.ObjectId(req.body.employeeId);
    } else {
      // Labour record - check by employeeName + mobileNumber + date + projectId
      // This allows multiple plumbers with same name but different mobile numbers
      duplicateQuery.employeeId = null;
      duplicateQuery.employeeName = req.body.employeeName?.trim();
      duplicateQuery.projectId = new mongoose.Types.ObjectId(req.body.projectId);
      
      // Include mobileNumber in duplicate check if provided
      // This differentiates between different people with the same name
      if (req.body.mobileNumber && req.body.mobileNumber.trim()) {
        const mobileNumber = req.body.mobileNumber.trim();
        // Check for exact match: same name + same mobile number + same date + same project
        duplicateQuery.mobileNumber = mobileNumber;
      } else {
        // If no mobile number provided, check for records with no mobile number
        // This prevents duplicates when mobile number is not provided
        duplicateQuery.$or = [
          { mobileNumber: { $exists: false } },
          { mobileNumber: null },
          { mobileNumber: '' }
        ];
      }
    }

    console.log('🔍 Checking for duplicate attendance:', {
      query: duplicateQuery,
      employeeName: req.body.employeeName,
      mobileNumber: req.body.mobileNumber,
      projectId: req.body.projectId,
      date: normalizedDate
    });

    const existingAttendance = await Attendance.findOne(duplicateQuery);
    
    if (existingAttendance) {
      console.log('⚠️ Duplicate attendance found:', {
        existingId: existingAttendance._id,
        existingName: existingAttendance.employeeName,
        existingMobile: existingAttendance.mobileNumber,
        existingDate: existingAttendance.date,
        existingProject: existingAttendance.projectId
      });
      
      res.status(400).json({
        success: false,
        error: 'Duplicate attendance record',
        message: req.body.employeeId 
          ? 'Attendance for this employee on this date already exists'
          : `Attendance for "${req.body.employeeName}"${req.body.mobileNumber ? ` (${req.body.mobileNumber})` : ''} on this date in this project already exists. Please update the existing record instead.`
      });
      return;
    }
    
    console.log('✅ No duplicate found, proceeding with creation');

    // Ensure attachments are properly formatted as ObjectIds
    let attachments: mongoose.Types.ObjectId[] = [];
    if (req.body.attachments && Array.isArray(req.body.attachments) && req.body.attachments.length > 0) {
      console.log('📎 Received attachments:', {
        count: req.body.attachments.length,
        attachments: req.body.attachments,
        types: req.body.attachments.map((id: any) => typeof id)
      });
      
      attachments = req.body.attachments
        .filter((id: any) => {
          if (!id) return false;
          // Convert to string first to check validity
          const idString = id.toString();
          const isValid = mongoose.Types.ObjectId.isValid(idString);
          if (!isValid) {
            console.warn('⚠️ Invalid attachment ID:', id, 'type:', typeof id);
          }
          return isValid;
        })
        .map((id: any) => {
          // Convert to string first, then to ObjectId
          const idString = id.toString();
          return new mongoose.Types.ObjectId(idString);
        });
      
      console.log('✅ Processed attachments as ObjectIds:', {
        count: attachments.length,
        attachments: attachments.map(id => id.toString())
      });
    } else {
      console.log('⚠️ No attachments provided or empty array:', {
        hasAttachments: !!req.body.attachments,
        isArray: Array.isArray(req.body.attachments),
        length: req.body.attachments?.length || 0
      });
    }

    const attendanceData = {
      ...req.body,
      projectName: projectName,
      date: attendanceDate,
      status: req.body.status || 'present',
      hours: req.body.hours || 0,
      attachments: attachments.length > 0 ? attachments : (req.body.attachments || []),
      isApproved: false
    };

    console.log('💾 Creating attendance with data:', {
      employeeName: attendanceData.employeeName,
      projectId: attendanceData.projectId,
      attachmentsCount: attendanceData.attachments.length,
      attachments: attendanceData.attachments
    });

    const attendance = await Attendance.create(attendanceData);

    console.log('✅ Attendance created:', {
      id: attendance._id,
      attachmentsCount: attendance.attachments?.length || 0,
      attachments: attendance.attachments,
      attachmentsType: attendance.attachments?.map((id: any) => typeof id)
    });

    // Verify attachments were saved by fetching the record again
    const savedAttendance = await Attendance.findById(attendance._id);
    console.log('🔍 Saved attendance verification:', {
      id: savedAttendance?._id,
      attachmentsCount: savedAttendance?.attachments?.length || 0,
      attachments: savedAttendance?.attachments
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('projectId', 'name')
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name email')
      .populate('attachments'); // Populate attachments to include file details

    if (!populatedAttendance) {
      res.status(404).json({
        success: false,
        error: 'Attendance record not found after creation'
      });
      return;
    }

    console.log('📋 Populated attendance:', {
      id: populatedAttendance._id,
      attachmentsCount: populatedAttendance.attachments?.length || 0,
      attachments: populatedAttendance.attachments,
      attachmentsDetails: populatedAttendance.attachments?.map((att: any) => ({
        id: att._id || att.id,
        name: att.originalName || att.filename,
        type: typeof att
      }))
    });

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

    // Ensure attachments are properly formatted as ObjectIds if provided
    if (req.body.attachments && Array.isArray(req.body.attachments)) {
      req.body.attachments = req.body.attachments
        .filter((id: any) => id && mongoose.Types.ObjectId.isValid(id))
        .map((id: any) => new mongoose.Types.ObjectId(id));
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('projectId', 'name')
     .populate('employeeId', 'name email')
     .populate('approvedBy', 'name email')
     .populate('attachments'); // Populate attachments to include file details

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
