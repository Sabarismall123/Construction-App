import mongoose, { Document, Schema } from 'mongoose';

export interface IFileAttachment extends Document {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  data: Buffer; // Store file data as Buffer
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  issueId?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FileAttachmentSchema = new Schema<IFileAttachment>({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    unique: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  data: {
    type: Buffer,
    required: [true, 'File data is required']
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  }
}, {
  timestamps: true
});

// Index for better query performance
FileAttachmentSchema.index({ taskId: 1 });
FileAttachmentSchema.index({ projectId: 1 });
FileAttachmentSchema.index({ issueId: 1 });
FileAttachmentSchema.index({ uploadedBy: 1 });
FileAttachmentSchema.index({ createdAt: 1 });

export default mongoose.model<IFileAttachment>('FileAttachment', FileAttachmentSchema);
