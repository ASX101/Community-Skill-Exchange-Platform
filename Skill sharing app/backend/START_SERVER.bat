@echo off
cd /d "%~dp0"
echo Starting Laravel Development Server...
echo.
echo Server will run on: http://localhost:8000
echo.
php -S localhost:8000 -t public
pause
