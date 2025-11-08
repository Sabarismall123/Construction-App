import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  name: string;
  type: 'equipment' | 'material' | 'vehicle' | 'tool' | 'other';
  category: string;
  description: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  assignedTo?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  maintenanceSchedule?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['equipment', 'material', 'vehicle', 'tool', 'other'],
    required: [true, 'Resource type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    maxlength: [20, 'Unit cannot be more than 20 characters']
  },
  costPerUnit: {
    type: Number,
    required: [true, 'Cost per unit is required'],
    min: [0, 'Cost cannot be negative']
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: [100, 'Supplier name cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'out_of_order'],
    default: 'available',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  warrantyExpiry: {
    type: Date
  },
  maintenanceSchedule: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
ResourceSchema.index({ name: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ status: 1 });
ResourceSchema.index({ assignedTo: 1 });
ResourceSchema.index({ projectId: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema);
