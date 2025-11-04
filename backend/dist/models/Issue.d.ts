import mongoose, { Document } from 'mongoose';
export interface IComment {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
}
export interface IIssue extends Document {
    title: string;
    description: string;
    projectId: mongoose.Types.ObjectId;
    reportedBy: mongoose.Types.ObjectId | string;
    assignedTo?: mongoose.Types.ObjectId | string;
    assignedToName?: string;
    reportedByName?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    category: 'safety' | 'quality' | 'schedule' | 'cost' | 'other';
    location?: string;
    attachments: mongoose.Types.ObjectId[];
    comments: IComment[];
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IIssue, {}, {}, {}, mongoose.Document<unknown, {}, IIssue, {}, {}> & IIssue & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Issue.d.ts.map