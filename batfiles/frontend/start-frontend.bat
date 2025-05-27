@echo off
echo ========================================
echo      FRONTEND WIRD GESTARTET...
echo ========================================
echo Frontend: http://localhost:3000
echo.

echo Current directory: %CD%
echo Script directory: %~dp0

cd /d "%~dp0..\.."
echo Changed to: %CD%

echo Running docker-compose...
docker-compose -f frontend/docker-compose.yml up --build

echo.
echo Frontend beendet.
pause