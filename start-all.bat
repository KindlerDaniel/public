@echo off
echo ========================================
echo    SYSTEM WIRD VORBEREITET UND GESTARTET
echo ========================================
echo.

echo [1/3] Netzwerk-Setup wird ausgeführt...
call batfiles\setup-network.bat

echo.
echo [2/3] API Gateway wird gestartet...
call batfiles\start-gateway.bat

echo.
echo [3/3] Alle Services werden gestartet...
call batfiles\start-all.bat

echo.
echo ========================================
echo        SYSTEM VOLLSTÄNDIG GESTARTET!
echo ========================================
pause