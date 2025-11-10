import mongoose, { Document, Schema } from 'mongoose';

export interface IMaterialReturn extends Document {
  projectId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  materialId: mongoose.Types.ObjectId;
  quantity: number;
  returnDate: Date;
  returnedBy: mongoose.Types.ObjectId;
  receivedBy: string;
  condition: 'good' | 'fair' | 'poor' | 'damaged';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialReturnSchema = new Schema<IMaterialReturn>({
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
  returnDate: {
    type: Date,
    required: [true, 'Return date is required'],
    default: Date.now
  },
  returnedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Returned by is required']
  },
  receivedBy: {
    type: String,
    required: [true, 'Received by is required'],
    trim: true,
    maxlength: [100, 'Received by cannot be more than 100 characters']
  },
  condition: {
    type: String,
    enum: ['good', 'fair', 'poor', 'damaged'],
    default: 'good'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model<IMaterialReturn>('MaterialReturn', MaterialReturnSchema);

