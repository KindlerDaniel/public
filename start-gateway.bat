@echo off
echo ========================================
echo      API Gateway wird gestartet...
echo ========================================
echo Kong Proxy:  http://localhost:8000
echo Kong Admin:  http://localhost:8001
echo.

docker-compose -f backend/gateway/docker-compose.yml up --build

echo.
echo API Gateway beendet.
pause