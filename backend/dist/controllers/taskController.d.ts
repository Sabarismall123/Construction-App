import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getTasks: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTasksByProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=taskController.d.ts.map