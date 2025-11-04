"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AttendanceSchema = new mongoose_1.Schema({
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    employeeName: {
        type: String,
        required: [true, 'Employee/Labor name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    mobileNumber: {
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits']
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required']
    },
    projectName: {
        type: String,
        trim: true
    },
    labourType: {
        type: String,
        trim: true,
        maxlength: [50, 'Labour type cannot be more than 50 characters']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    timeIn: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    timeOut: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half_day', 'overtime'],
        default: 'present',
        required: true
    },
    hours: {
        type: Number,
        min: [0, 'Hours cannot be negative'],
        max: [24, 'Hours cannot exceed 24'],
        default: 0
    },
    overtimeHours: {
        type: Number,
        min: [0, 'Overtime hours cannot be negative'],
        default: 0
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ projectId: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });
exports.default = mongoose_1.default.model('Attendance', AttendanceSchema);
//# sourceMappingURL=Attendance.js.map