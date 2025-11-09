import mongoose, { Document, Schema } from 'mongoose';

export interface ILabour extends Document {
  name: string;
  mobileNumber?: string;
  labourType?: string;
  projectId?: mongoose.Types.ObjectId; // Default project
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LabourSchema = new Schema<ILabour>({
  name: {
    type: String,
    required: [true, 'Labour name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  mobileNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits']
  },
  labourType: {
    type: String,
    trim: true,
    maxlength: [50, 'Labour type cannot be more than 50 characters']
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
LabourSchema.index({ name: 1 });
LabourSchema.index({ projectId: 1 });
LabourSchema.index({ isActive: 1 });
LabourSchema.index({ createdBy: 1 });

export default mongoose.model<ILabour>('Labour', LabourSchema);

