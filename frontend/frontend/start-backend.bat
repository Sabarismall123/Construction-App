@echo off
echo Starting Construction Management Backend...
echo.

cd backend

echo Creating .env file...
copy env.example .env >nul 2>&1

echo Installing dependencies...
call npm install

echo Starting backend server...
call npm run dev

pause
