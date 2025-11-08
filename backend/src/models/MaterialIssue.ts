import mongoose, { Document, Schema } from 'mongoose';

export interface IMaterialIssue extends Document {
  projectId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  materialId: mongoose.Types.ObjectId;
  quantity: number;
  issuedDate: Date;
  issuedBy: mongoose.Types.ObjectId;
  issuedTo: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialIssueSchema = new Schema<IMaterialIssue>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  materialId: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Material ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0']
  },
  issuedDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  issuedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issued by is required']
  },
  issuedTo: {
    type: String,
    required: [true, 'Issued to is required'],
    trim: true,
    maxlength: [100, 'Issued to cannot be more than 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model<IMaterialIssue>('MaterialIssue', MaterialIssueSchema);

