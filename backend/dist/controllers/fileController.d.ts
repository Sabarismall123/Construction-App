import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
import multer from 'multer';
declare const upload: multer.Multer;
export declare const uploadFile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const uploadMultipleFiles: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFile: (req: Request, res: Response) => Promise<void>;
export declare const getFileInfo: (req: Request, res: Response) => Promise<void>;
export declare const deleteFile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFilesByTask: (req: Request, res: Response) => Promise<void>;
export { upload };
//# sourceMappingURL=fileController.d.ts.map