import mongoose, { Document, Schema } from 'mongoose';

export interface ICommercial extends Document {
  projectId: mongoose.Types.ObjectId;
  type: 'invoice' | 'payment' | 'expense' | 'purchase_order' | 'other';
  date: Date;
  amount: number;
  description: string;
  vendor?: string;
  invoiceNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  relatedTo?: string;
  attachments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommercialSchema = new Schema<ICommercial>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  type: {
    type: String,
    enum: ['invoice', 'payment', 'expense', 'purchase_order', 'other'],
    required: [true, 'Type is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  vendor: {
    type: String,
    trim: true,
    maxlength: [100, 'Vendor name cannot be more than 100 characters']
  },
  invoiceNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Invoice number cannot be more than 50 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'],
    default: 'pending',
    required: true
  },
  relatedTo: {
    type: String,
    trim: true,
    maxlength: [100, 'Related to cannot be more than 100 characters']
  },
  attachments: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
CommercialSchema.index({ projectId: 1 });
CommercialSchema.index({ type: 1 });
CommercialSchema.index({ status: 1 });
CommercialSchema.index({ date: -1 });

export default mongoose.model<ICommercial>('Commercial', CommercialSchema);

