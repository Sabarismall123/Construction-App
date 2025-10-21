import mongoose, { Document, Schema } from 'mongoose';

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

const PettyCashSchema = new Schema<IPettyCash>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by is required']
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  category: {
    type: String,
    enum: ['fuel', 'meals', 'transport', 'supplies', 'other'],
    required: [true, 'Category is required']
  },
  receiptNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Receipt number cannot be more than 50 characters']
  },
  receiptImage: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reimbursed'],
    default: 'pending',
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  approvalDate: {
    type: Date
  },
  reimbursementDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
PettyCashSchema.index({ projectId: 1 });
PettyCashSchema.index({ requestedBy: 1 });
PettyCashSchema.index({ status: 1 });
PettyCashSchema.index({ requestDate: -1 });

export default mongoose.model<IPettyCash>('PettyCash', PettyCashSchema);
