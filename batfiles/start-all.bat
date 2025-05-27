@echo off
echo ========================================
echo      ALLE SERVICES WERDEN GESTARTET
echo ========================================
echo.

echo Current working directory: %CD%
echo Script is located at: %~dp0

echo [1/2] Starte Datenbanken...
call "%~dp0databases\start-databases.bat"

echo.
echo [2/2] Warte auf Datenbankinitialisierung...
echo (PostgreSQL, Neo4j und MinIO benötigen Zeit zum Starten)
timeout /t 25 /nobreak >nul

echo.
echo Starte Backend und Frontend Services...

echo Starting MediaService...
start "MediaService" cmd /c "cd /d "%~dp0" && call backend\start-mediaservice.bat"
timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /c "cd /d "%~dp0" && call frontend\start-frontend.bat"

echo.
echo ========================================
echo         SERVICES WERDEN GESTARTET...
echo ========================================
echo.
echo Verfügbare Services:
echo ✓ Frontend:     http://localhost:3000
echo ✓ API Gateway:  http://localhost:8000
echo ✓ MediaService: http://localhost:3001
echo ✓ PostgreSQL:   localhost:5432
echo ✓ Neo4j:        http://localhost:7474
echo ✓ MinIO Admin:  http://localhost:9001
echo.
echo Die Services starten in separaten Fenstern.
echo Zum Stoppen aller Services nutzen Sie stop-all.bat
echo.
pause