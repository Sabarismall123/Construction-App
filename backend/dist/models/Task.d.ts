import mongoose, { Document } from 'mongoose';
export interface ITask extends Document {
    title: string;
    description: string;
    projectId: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId | string;
    assignedToName?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'review' | 'completed';
    dueDate: Date;
    estimatedHours: number;
    actualHours?: number;
    tags: string[];
    attachments: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, {}> & ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Task.d.ts.map