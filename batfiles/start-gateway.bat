@echo off
echo ========================================
echo      API GATEWAY WIRD GESTARTET...
echo ========================================
echo Kong Proxy:  http://localhost:8000
echo Kong Admin:  http://localhost:8001
echo.

cd /d "%~dp0.."

start "API Gateway" cmd /c "docker-compose -f backend/gateway/docker-compose.yml up --build"

echo ✓ API Gateway wird in separatem Fenster gestartet...
echo ⏳ Gateway benötigt einige Sekunden zum Initialisieren.
echo.
timeout /t 5 /nobreak >nul

echo ========================================