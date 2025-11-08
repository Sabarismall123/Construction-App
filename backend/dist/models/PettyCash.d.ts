import mongoose, { Document } from 'mongoose';
export interface IPettyCash extends Document {
    projectId: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    amount: number;
    description: string;
    category: 'fuel' | 'meals' | 'transport' | 'supplies' | 'other';
    receiptNumber?: string;
    receiptImage?: string;
    status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
    requestDate: Date;
    approvalDate?: Date;
    reimbursementDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPettyCash, {}, {}, {}, mongoose.Document<unknown, {}, IPettyCash, {}, {}> & IPettyCash & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=PettyCash.d.ts.map