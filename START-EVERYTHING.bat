@echo off
echo ========================================
echo  CONSTRUCTION MANAGEMENT SYSTEM
echo ========================================
echo.
echo Starting Backend Server...
echo.

cd backend
start "Backend Server" cmd /k "npm run dev"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
echo.

cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo  BOTH SERVERS ARE STARTING!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
