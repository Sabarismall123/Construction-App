import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getIssues: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getIssue: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createIssue: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateIssue: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteIssue: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getIssuesByProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=issueController.d.ts.map