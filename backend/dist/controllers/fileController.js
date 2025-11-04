"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.getFilesByTask = exports.deleteFile = exports.getFileInfo = exports.getFile = exports.uploadMultipleFiles = exports.uploadFile = void 0;
const multer_1 = __importDefault(require("multer"));
const FileAttachment_1 = __importDefault(require("../models/FileAttachment"));
const Task_1 = __importDefault(require("../models/Task"));
const Issue_1 = __importDefault(require("../models/Issue"));
const mongoose_1 = __importDefault(require("mongoose"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
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
        }
        else {
            cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
        }
    }
});
exports.upload = upload;
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
            return;
        }
        const { taskId, projectId, issueId } = req.body;
        const userId = req.user?._id || new mongoose_1.default.Types.ObjectId();
        console.log('📤 File upload request:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            taskId,
            projectId,
            userId
        });
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${req.file.originalname}`;
        const fileAttachment = new FileAttachment_1.default({
            filename: filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            data: req.file.buffer,
            taskId: taskId ? new mongoose_1.default.Types.ObjectId(taskId) : undefined,
            projectId: projectId ? new mongoose_1.default.Types.ObjectId(projectId) : undefined,
            issueId: issueId ? new mongoose_1.default.Types.ObjectId(issueId) : undefined,
            uploadedBy: userId
        });
        await fileAttachment.save();
        if (taskId) {
            console.log('🔗 Linking file to task:', taskId);
            const task = await Task_1.default.findById(taskId);
            if (task) {
                task.attachments.push(fileAttachment._id);
                await task.save();
                console.log('✅ File linked to task successfully');
            }
            else {
                console.log('❌ Task not found:', taskId);
            }
        }
        if (issueId) {
            console.log('🔗 Linking file to issue:', issueId);
            const issue = await Issue_1.default.findById(issueId);
            if (issue) {
                issue.attachments.push(fileAttachment._id);
                await issue.save();
                console.log('✅ File linked to issue successfully');
            }
            else {
                console.log('❌ Issue not found:', issueId);
            }
        }
        if (!taskId && !issueId) {
            console.log('⚠️ No taskId or issueId provided for file upload');
        }
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
    }
    catch (error) {
        console.error('❌ File upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.uploadFile = uploadFile;
const uploadMultipleFiles = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
            return;
        }
        const { taskId, projectId, issueId } = req.body;
        const userId = req.user?._id || new mongoose_1.default.Types.ObjectId();
        const uploadedFiles = [];
        for (const file of req.files) {
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
            const fileAttachment = new FileAttachment_1.default({
                filename: filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                data: file.buffer,
                taskId: taskId ? new mongoose_1.default.Types.ObjectId(taskId) : undefined,
                projectId: projectId ? new mongoose_1.default.Types.ObjectId(projectId) : undefined,
                issueId: issueId ? new mongoose_1.default.Types.ObjectId(issueId) : undefined,
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
            if (taskId) {
                await Task_1.default.findByIdAndUpdate(taskId, { $push: { attachments: fileAttachment._id } }, { new: true });
            }
            if (issueId) {
                await Issue_1.default.findByIdAndUpdate(issueId, { $push: { attachments: fileAttachment._id } }, { new: true });
            }
        }
        res.status(201).json({
            success: true,
            data: uploadedFiles
        });
    }
    catch (error) {
        console.error('Multiple file upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload files'
        });
    }
};
exports.uploadMultipleFiles = uploadMultipleFiles;
const getFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(fileId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid file ID'
            });
            return;
        }
        const file = await FileAttachment_1.default.findById(fileId);
        if (!file) {
            res.status(404).json({
                success: false,
                error: 'File not found'
            });
            return;
        }
        res.set({
            'Content-Type': file.mimetype,
            'Content-Disposition': `inline; filename="${file.originalName}"`,
            'Content-Length': file.size.toString()
        });
        res.send(file.data);
    }
    catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve file'
        });
    }
};
exports.getFile = getFile;
const getFileInfo = async (req, res) => {
    try {
        const { fileId } = req.params;
        console.log('🔍 Getting file info for ID:', fileId);
        if (!mongoose_1.default.Types.ObjectId.isValid(fileId)) {
            console.log('❌ Invalid file ID format:', fileId);
            res.status(400).json({
                success: false,
                error: 'Invalid file ID'
            });
            return;
        }
        const file = await FileAttachment_1.default.findById(fileId).select('-data');
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
    }
    catch (error) {
        console.error('❌ Get file info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve file info'
        });
    }
};
exports.getFileInfo = getFileInfo;
const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user?._id || new mongoose_1.default.Types.ObjectId();
        if (!mongoose_1.default.Types.ObjectId.isValid(fileId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid file ID'
            });
            return;
        }
        const file = await FileAttachment_1.default.findById(fileId);
        if (!file) {
            res.status(404).json({
                success: false,
                error: 'File not found'
            });
            return;
        }
        await Task_1.default.updateMany({ attachments: fileId }, { $pull: { attachments: fileId } });
        await FileAttachment_1.default.findByIdAndDelete(fileId);
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete file'
        });
    }
};
exports.deleteFile = deleteFile;
const getFilesByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(taskId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid task ID'
            });
            return;
        }
        const files = await FileAttachment_1.default.find({ taskId }).select('-data');
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
    }
    catch (error) {
        console.error('Get files by task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve files'
        });
    }
};
exports.getFilesByTask = getFilesByTask;
//# sourceMappingURL=fileController.js.map