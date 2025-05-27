@echo off
echo ========================================
echo      MEDIASERVICE WIRD GESTARTET...
echo ========================================
echo MediaService: http://localhost:3001
echo.

echo Current directory: %CD%
echo Script directory: %~dp0

cd /d "%~dp0..\.."
echo Changed to: %CD%

echo Running docker-compose...
docker-compose -f backend/mediaservice/docker-compose.yml up --build

echo.
echo MediaService beendet.
pause