import express from 'express';
import { uploadFile, uploadMultipleFiles, getFile, getFileInfo, deleteFile, getFilesByTask, upload } from '../controllers/fileController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Upload single file (temporarily public for testing)
router.post('/upload', upload.single('file'), uploadFile);

// Upload multiple files (temporarily public for testing)
router.post('/upload-multiple', upload.array('files', 10), uploadMultipleFiles);

// Get file by ID (returns file data)
router.get('/:fileId', getFile);

// Get file info by ID (returns metadata only)
router.get('/:fileId/info', getFileInfo);

// Delete file
router.delete('/:fileId', protect, deleteFile);

// Get files by task ID
router.get('/task/:taskId', getFilesByTask);

export default router;
