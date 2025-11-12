import mongoose, { Document, Schema } from 'mongoose';

export interface IMaterialConsumption extends Document {
  projectId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  materialId: mongoose.Types.ObjectId;
  quantity: number;
  consumptionDate: Date;
  recordedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialConsumptionSchema = new Schema<IMaterialConsumption>({
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
  consumptionDate: {
    type: Date,
    required: [true, 'Consumption date is required'],
    default: Date.now
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recorded by is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model<IMaterialConsumption>('MaterialConsumption', MaterialConsumptionSchema);

