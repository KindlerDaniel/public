@echo off
echo ========================================
echo    ALLE SERVICES WERDEN GESTOPPT...
echo ========================================

echo [1/4] Stoppe Frontend...
call "%~dp0frontend\stop-frontend.bat"

echo.
echo [2/4] Stoppe MediaService...
call "%~dp0backend\stop-backend-services.bat"

echo.
echo [3/4] Stoppe API Gateway...
call "%~dp0stop-gateway.bat"

echo.
echo [4/4] Stoppe Datenbanken...
call "%~dp0databases\stop-databases.bat"

echo.
echo ========================================
echo     ALLE SERVICES GESTOPPT!
echo ========================================