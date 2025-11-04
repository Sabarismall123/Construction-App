import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | string; // Allow both ObjectId and string
  assignedToName?: string; // Store the name for display
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  dueDate: Date;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  attachments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  assignedTo: {
    type: Schema.Types.Mixed, // Allow both ObjectId and string
    required: [true, 'Assigned user is required']
  },
  assignedToName: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours is required'],
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'FileAttachment'
  }]
}, {
  timestamps: true
});

// Index for better query performance
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
