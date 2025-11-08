import mongoose, { Document } from 'mongoose';
export interface IFileAttachment extends Document {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    data: Buffer;
    taskId?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    issueId?: mongoose.Types.ObjectId;
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IFileAttachment, {}, {}, {}, mongoose.Document<unknown, {}, IFileAttachment, {}, {}> & IFileAttachment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=FileAttachment.d.ts.map