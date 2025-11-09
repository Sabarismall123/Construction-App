import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employeeId?: mongoose.Types.ObjectId; // Optional for labor records
  employeeName: string; // Labor name
  mobileNumber?: string; // Mobile number
  projectId: mongoose.Types.ObjectId;
  projectName?: string; // Project name for display
  labourType?: string; // Type of labor
  date: Date;
  timeIn?: string; // HH:MM format
  timeOut?: string; // HH:MM format
  status: 'present' | 'absent' | 'late' | 'half_day' | 'overtime';
  hours?: number;
  overtimeHours?: number;
  notes?: string;
  attachments?: mongoose.Types.ObjectId[]; // Image attachments with date/time watermark
  approvedBy?: mongoose.Types.ObjectId;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for labor records
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
    type: Schema.Types.ObjectId,
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
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'FileAttachment'
  }],
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
// Note: We removed the unique constraint on employeeId_1_date_1 because it was causing issues
// with multiple labour records (employeeId: null) on the same date.
// Duplicate checking is now handled in the controller by checking employeeName + date + projectId for labour records.

// For employees (with employeeId), non-unique index for query performance
// Only applies when employeeId is not null (for actual employees, not labour)
AttendanceSchema.index({ employeeId: 1, date: 1 }, { 
  partialFilterExpression: { employeeId: { $ne: null } }
});

// For labour records, non-unique index for query performance
// Multiple different labours (e.g., multiple carpenters) can have attendance on the same date
AttendanceSchema.index({ employeeName: 1, date: 1, projectId: 1 }, { 
  partialFilterExpression: { employeeId: null }
});

// Regular indexes for query performance
AttendanceSchema.index({ projectId: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
