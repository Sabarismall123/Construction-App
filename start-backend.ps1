Write-Host "Starting Construction Management Backend..." -ForegroundColor Green
Write-Host ""

Set-Location backend

Write-Host "Creating .env file..." -ForegroundColor Yellow
Copy-Item env.example .env -Force

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Starting backend server..." -ForegroundColor Yellow
npm run dev
