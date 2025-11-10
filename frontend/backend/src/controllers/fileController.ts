import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}
import multer from 'multer';
import FileAttachment from '../models/FileAttachment';
import Task from '../models/Task';
import Issue from '../models/Issue';
import mongoose from 'mongoose';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
    }
  }
});

// Upload single file
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
      return;
    }

    const { taskId, projectId, issueId } = req.body;
    const userId = req.user?._id || new mongoose.Types.ObjectId(); // Use mock user ID if no auth
    
    console.log('📤 File upload request:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      taskId,
      projectId,
      userId
    });

    // Generate unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${req.file.originalname}`;

    // Create file attachment record
    const fileAttachment = new FileAttachment({
      filename: filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      taskId: taskId ? new mongoose.Types.ObjectId(taskId) : undefined,
      projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
      issueId: issueId ? new mongoose.Types.ObjectId(issueId) : undefined,
      uploadedBy: userId
    });

    await fileAttachment.save();

    // If taskId is provided, add attachment to task
    if (taskId) {
      console.log('🔗 Linking file to task:', taskId);
      const task = await Task.findById(taskId);
      if (task) {
        task.attachments.push(fileAttachment._id as mongoose.Types.ObjectId);
        await task.save();
        console.log('✅ File linked to task successfully');
      } else {
        console.log('❌ Task not found:', taskId);
      }
    }

    // If issueId is provided, add attachment to issue
    if (issueId) {
      console.log('🔗 Linking file to issue:', issueId);
      const issue = await Issue.findById(issueId);
      if (issue) {
        issue.attachments.push(fileAttachment._id as mongoose.Types.ObjectId);
        await issue.save();
        console.log('✅ File linked to issue successfully');
      } else {
        console.log('❌ Issue not found:', issueId);
      }
    }

    // Note: For attendance photos, neither taskId nor issueId is required
    // This is expected behavior, so we don't log a warning

    res.status(201).json({
      success: true,
      data: {
        id: fileAttachment._id,
        filename: fileAttachment.filename,
        originalName: fileAttachment.originalName,
        mimetype: fileAttachment.mimetype,
        size: fileAttachment.size,
        uploadedAt: fileAttachment.createdAt
      }
    });
  } catch (error) {
    console.error('❌ File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    const { taskId, projectId, issueId } = req.body;
    const userId = req.user?._id || new mongoose.Types.ObjectId(); // Use mock user ID if no auth

    const uploadedFiles = [];

    for (const file of req.files as Express.Multer.File[]) {
      // Generate unique filename
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;

      // Create file attachment record
      const fileAttachment = new FileAttachment({
        filename: filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer,
        taskId: taskId ? new mongoose.Types.ObjectId(taskId) : undefined,
        projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
        issueId: issueId ? new mongoose.Types.ObjectId(issueId) : undefined,
        uploadedBy: userId
      });

      await fileAttachment.save();
      uploadedFiles.push({
        id: fileAttachment._id,
        filename: fileAttachment.filename,
        originalName: fileAttachment.originalName,
        mimetype: fileAttachment.mimetype,
        size: fileAttachment.size,
        uploadedAt: fileAttachment.createdAt
      });

      // If taskId is provided, add attachment to task
      if (taskId) {
        await Task.findByIdAndUpdate(
          taskId,
          { $push: { attachments: fileAttachment._id as mongoose.Types.ObjectId } },
          { new: true }
        );
      }

      // If issueId is provided, add attachment to issue
      if (issueId) {
        await Issue.findByIdAndUpdate(
          issueId,
          { $push: { attachments: fileAttachment._id as mongoose.Types.ObjectId } },
          { new: true }
        );
      }
    }

    res.status(201).json({
      success: true,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
};

// Get file by ID
export const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid file ID'
      });
      return;
    }

    const file = await FileAttachment.findById(fileId);

    if (!file) {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
      return;
    }

    // Set appropriate headers
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `inline; filename="${file.originalName}"`,
      'Content-Length': file.size.toString()
    });

    res.send(file.data);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file'
    });
  }
};

// Get file info by ID
export const getFileInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    
    console.log('🔍 Getting file info for ID:', fileId);

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      console.log('❌ Invalid file ID format:', fileId);
      res.status(400).json({
        success: false,
        error: 'Invalid file ID'
      });
      return;
    }

    const file = await FileAttachment.findById(fileId).select('-data'); // Exclude file data
    
    console.log('📄 File found:', file ? 'Yes' : 'No');
    if (file) {
      console.log('📄 File details:', {
        id: file._id,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size
      });
    }

    if (!file) {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: file.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get file info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file info'
    });
  }
};

// Delete file
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const userId = req.user?._id || new mongoose.Types.ObjectId(); // Use mock user ID if no auth

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid file ID'
      });
      return;
    }

    const file = await FileAttachment.findById(fileId);

    if (!file) {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
      return;
    }

    // Skip permission check for mock authentication
    // In production, you would check if user has permission to delete

    // Remove file reference from tasks
    await Task.updateMany(
      { attachments: fileId },
      { $pull: { attachments: fileId } }
    );

    // Delete the file
    await FileAttachment.findByIdAndDelete(fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
};

// Get files by task ID
export const getFilesByTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID'
      });
      return;
    }

    const files = await FileAttachment.find({ taskId }).select('-data');

    res.json({
      success: true,
      data: files.map(file => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: file.createdAt
      }))
    });
  } catch (error) {
    console.error('Get files by task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve files'
    });
  }
};

export { upload };
