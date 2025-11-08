import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getAttendance: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttendanceRecord: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createAttendance: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateAttendance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAttendance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttendanceByProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=attendanceController.d.ts.map