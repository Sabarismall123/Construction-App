@echo off
echo Starting Construction Management Backend Server...
echo.

cd backend

echo Checking if .env file exists...
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo .env file created successfully!
)

echo Starting backend server...
npm run dev

pause
