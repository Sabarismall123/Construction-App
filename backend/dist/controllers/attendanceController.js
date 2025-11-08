"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceByProject = exports.deleteAttendance = exports.updateAttendance = exports.createAttendance = exports.getAttendanceRecord = exports.getAttendance = void 0;
const express_validator_1 = require("express-validator");
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Project_1 = __importDefault(require("../models/Project"));
const getAttendance = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, projectId, employeeName, search, date } = req.query;
        const query = {};
        if (projectId)
            query.projectId = projectId;
        if (status)
            query.status = status;
        if (employeeName)
            query.employeeName = { $regex: employeeName, $options: 'i' };
        if (date) {
            const searchDate = new Date(date);
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
        const attendance = await Attendance_1.default.find(query)
            .populate('projectId', 'name')
            .populate('employeeId', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ date: -1, createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Attendance_1.default.countDocuments(query);
        res.json({
            success: true,
            count: attendance.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: attendance
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAttendance = getAttendance;
const getAttendanceRecord = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const attendance = await Attendance_1.default.findById(req.params.id)
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAttendanceRecord = getAttendanceRecord;
const createAttendance = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const project = await Project_1.default.findById(req.body.projectId);
        const projectName = project ? project.name : 'Unknown Project';
        const attendanceData = {
            ...req.body,
            projectName: projectName,
            date: req.body.date ? new Date(req.body.date) : new Date(),
            status: req.body.status || 'present',
            hours: req.body.hours || 0,
            isApproved: false
        };
        const attendance = await Attendance_1.default.create(attendanceData);
        const populatedAttendance = await Attendance_1.default.findById(attendance._id)
            .populate('projectId', 'name')
            .populate('employeeId', 'name email')
            .populate('approvedBy', 'name email');
        res.status(201).json({
            success: true,
            data: populatedAttendance
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAttendance = createAttendance;
const updateAttendance = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        if (req.body.projectId) {
            const project = await Project_1.default.findById(req.body.projectId);
            if (project) {
                req.body.projectName = project.name;
            }
        }
        const attendance = await Attendance_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('projectId', 'name')
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateAttendance = updateAttendance;
const deleteAttendance = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const attendance = await Attendance_1.default.findById(req.params.id);
        if (!attendance) {
            res.status(404).json({
                success: false,
                error: 'Attendance record not found'
            });
            return;
        }
        await Attendance_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAttendance = deleteAttendance;
const getAttendanceByProject = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const attendance = await Attendance_1.default.find({ projectId: req.params.projectId })
            .populate('employeeId', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ date: -1, createdAt: -1 });
        res.json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAttendanceByProject = getAttendanceByProject;
//# sourceMappingURL=attendanceController.js.map