import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteTransfer extends Document {
  fromProjectId: mongoose.Types.ObjectId;
  toProjectId: mongoose.Types.ObjectId;
  materialId: mongoose.Types.ObjectId;
  quantity: number;
  transferDate: Date;
  transferredBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteTransferSchema = new Schema<ISiteTransfer>({
  fromProjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'From project ID is required']
  },
  toProjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'To project ID is required']
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
  transferDate: {
    type: Date,
    required: [true, 'Transfer date is required'],
    default: Date.now
  },
  transferredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Transferred by is required']
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
SiteTransferSchema.index({ fromProjectId: 1 });
SiteTransferSchema.index({ toProjectId: 1 });
SiteTransferSchema.index({ materialId: 1 });
SiteTransferSchema.index({ transferDate: -1 });

export default mongoose.model<ISiteTransfer>('SiteTransfer', SiteTransferSchema);

