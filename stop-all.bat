@echo off
echo ========================================
echo    ALLE SERVICES WERDEN GESTOPPT...
echo ========================================

call batfiles\stop-all.bat

echo.
echo [NACHBEREITUNG] Bereinige System...
echo.

set /p cleanup="Möchten Sie eine Systembereinigung durchführen? (j/n): "
if /i "%cleanup%"=="j" (
    echo Bereinige ungenutzte Container...
    docker container prune -f
    
    echo Bereinige ungenutzte Images...
    docker image prune -f
    
    echo Bereinige ungenutzte Volumes...
    docker volume prune -f
    
    echo ✓ Bereinigung abgeschlossen!
) else (
    echo Bereinigung übersprungen.
)

echo.
echo ========================================
echo     ALLE SERVICES GESTOPPT!
echo ========================================
pause