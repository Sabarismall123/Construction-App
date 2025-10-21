import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId | string; // Allow both ObjectId and string
  assignedTo?: mongoose.Types.ObjectId | string; // Allow both ObjectId and string
  assignedToName?: string; // Store the name for display
  reportedByName?: string; // Store the reporter name
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'safety' | 'quality' | 'schedule' | 'cost' | 'other';
  location?: string;
  attachments: string[];
  comments: IComment[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const IssueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  reportedBy: {
    type: Schema.Types.Mixed, // Allow both ObjectId and string
    required: [true, 'Reporter is required']
  },
  assignedTo: {
    type: Schema.Types.Mixed, // Allow both ObjectId and string
  },
  assignedToName: {
    type: String,
    trim: true
  },
  reportedByName: {
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
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    required: true
  },
  category: {
    type: String,
    enum: ['safety', 'quality', 'schedule', 'cost', 'other'],
    required: false,
    default: 'other'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  attachments: [{
    type: String,
    trim: true
  }],
  comments: [CommentSchema],
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
IssueSchema.index({ projectId: 1 });
IssueSchema.index({ reportedBy: 1 });
IssueSchema.index({ assignedTo: 1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ priority: 1 });
IssueSchema.index({ category: 1 });

export default mongoose.model<IIssue>('Issue', IssueSchema);
