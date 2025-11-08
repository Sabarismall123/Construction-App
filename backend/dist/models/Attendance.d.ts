import mongoose, { Document } from 'mongoose';
export interface IAttendance extends Document {
    employeeId?: mongoose.Types.ObjectId;
    employeeName: string;
    mobileNumber?: string;
    projectId: mongoose.Types.ObjectId;
    projectName?: string;
    labourType?: string;
    date: Date;
    timeIn?: string;
    timeOut?: string;
    status: 'present' | 'absent' | 'late' | 'half_day' | 'overtime';
    hours?: number;
    overtimeHours?: number;
    notes?: string;
    approvedBy?: mongoose.Types.ObjectId;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAttendance, {}, {}, {}, mongoose.Document<unknown, {}, IAttendance, {}, {}> & IAttendance & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Attendance.d.ts.map