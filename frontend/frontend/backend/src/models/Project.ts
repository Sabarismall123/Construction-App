import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  client: string;
  location: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  projectManager: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  siteVisits?: {
    visitType: 'site_visit' | 'inspection' | 'delivery' | 'maintenance';
    location: {
      latitude: number;
      longitude: number;
      accuracy: number;
      address?: string;
    };
    timestamp: Date;
    notes?: string;
    photos?: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: 'No description provided'
  },
  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters'],
    default: 'Not specified'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IProject, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'planning',
    required: true
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot be more than 100'],
    default: 0
  },
  projectManager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  gpsLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
    address: { type: String }
  },
  siteVisits: [{
    visitType: {
      type: String,
      enum: ['site_visit', 'inspection', 'delivery', 'maintenance'],
      required: true
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number, required: true },
      address: { type: String }
    },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
    photos: [{ type: String }]
  }]
}, {
  timestamps: true
});

// Index for better query performance
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ projectManager: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
