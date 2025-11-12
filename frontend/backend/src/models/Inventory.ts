import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  description?: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  unitCost: number;
  supplier?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Current stock cannot be negative'],
    default: 0
  },
  minThreshold: {
    type: Number,
    min: [0, 'Minimum threshold cannot be negative'],
    default: 0
  },
  maxThreshold: {
    type: Number,
    min: [0, 'Maximum threshold cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pcs', 'kg', 'tons', 'm', 'sqm', 'cum', 'bags'],
    default: 'pcs'
  },
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: [0, 'Unit cost cannot be negative'],
    default: 0
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: [100, 'Supplier name cannot be more than 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model<IInventory>('Inventory', InventorySchema);

