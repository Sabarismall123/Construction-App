import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getProjects: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createProject: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProjectStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=projectController.d.ts.map