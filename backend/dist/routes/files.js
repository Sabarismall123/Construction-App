"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = require("../controllers/fileController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/upload', fileController_1.upload.single('file'), fileController_1.uploadFile);
router.post('/upload-multiple', fileController_1.upload.array('files', 10), fileController_1.uploadMultipleFiles);
router.get('/:fileId', fileController_1.getFile);
router.get('/:fileId/info', fileController_1.getFileInfo);
router.delete('/:fileId', auth_1.protect, fileController_1.deleteFile);
router.get('/task/:taskId', fileController_1.getFilesByTask);
exports.default = router;
//# sourceMappingURL=files.js.map