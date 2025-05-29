@echo off
echo ========================================
echo    ALLE SERVICES WERDEN GESTOPPT...
echo ========================================
echo.

:: -------- STOPPE ALLE COMPOSE-SERVICES --------

:: Backend Services
cd /d "%~dp0backend\mediaservice"
docker-compose -f docker-compose.yml down

cd /d "%~dp0backend\gateway"
docker-compose -f docker-compose.yml down

:: Datenbanken
cd /d "%~dp0databases"
docker-compose -f docker-compose.yml down

:: Frontend
cd /d "%~dp0frontend"
docker-compose -f docker-compose.yml down

:: -------- OPTIONAL: SYSTEM BEREINIGEN --------
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
