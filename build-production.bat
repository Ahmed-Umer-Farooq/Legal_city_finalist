@echo off
echo Building Legal City for Production...

echo.
echo 1. Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend dependency installation failed!
    pause
    exit /b 1
)

echo.
echo 2. Installing frontend dependencies...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend dependency installation failed!
    pause
    exit /b 1
)

echo.
echo 3. Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo 4. Production build completed successfully!
echo.
echo To start the production server:
echo 1. Set NODE_ENV=production in backend/.env
echo 2. Run: cd backend && npm start
echo 3. Serve frontend build folder with a web server
echo.
pause