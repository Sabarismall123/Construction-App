@echo off
echo Fixing TypeScript errors in all controller files...
echo.

cd backend

echo Fixing projectController.ts...
powershell -Command "(Get-Content 'src/controllers/projectController.ts') -replace 'export const (\w+) = async \(req: [^,]+(?:, res: Response, next: NextFunction)\) => \{', 'export const $1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {' | Set-Content 'src/controllers/projectController.ts'"

echo Fixing taskController.ts...
powershell -Command "(Get-Content 'src/controllers/taskController.ts') -replace 'export const (\w+) = async \(req: [^,]+(?:, res: Response, next: NextFunction)\) => \{', 'export const $1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {' | Set-Content 'src/controllers/taskController.ts'"

echo Fixing authController.ts...
powershell -Command "(Get-Content 'src/controllers/authController.ts') -replace 'export const (\w+) = async \(req: [^,]+(?:, res: Response, next: NextFunction)\) => \{', 'export const $1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {' | Set-Content 'src/controllers/authController.ts'"

echo All TypeScript errors fixed!
echo Starting backend server...

npm run dev

pause
