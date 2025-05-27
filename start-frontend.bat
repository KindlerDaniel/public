@echo off
echo ========================================
echo      Frontend wird gestartet...
echo ========================================
echo.

docker-compose -f frontend/docker-compose.yml up --build

echo.
echo Frontend beendet.
pause