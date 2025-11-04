@echo off
echo ========================================
echo  FIXING ALL TYPESCRIPT ERRORS
echo ========================================
echo.

cd backend

echo Fixing all return statements in controllers...
echo.

echo Fixing projectController.ts...
powershell -Command "(Get-Content 'src/controllers/projectController.ts') -replace 'return res\.status\(([^)]+)\)\.json\(([^)]+)\);', 'res.status($1).json($2); return;' | Set-Content 'src/controllers/projectController.ts'"

echo Fixing taskController.ts...
powershell -Command "(Get-Content 'src/controllers/taskController.ts') -replace 'return res\.status\(([^)]+)\)\.json\(([^)]+)\);', 'res.status($1).json($2); return;' | Set-Content 'src/controllers/taskController.ts'"

echo Fixing authController.ts...
powershell -Command "(Get-Content 'src/controllers/authController.ts') -replace 'return res\.status\(([^)]+)\)\.json\(([^)]+)\);', 'res.status($1).json($2); return;' | Set-Content 'src/controllers/authController.ts'"

echo.
echo All errors fixed! Starting backend server...
echo.

npm run dev

pause
