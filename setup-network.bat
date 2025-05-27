@echo off
echo ========================================
echo    Erstelle gemeinsames Netzwerk...
========================================

docker network create app-network 2>nul
if %errorlevel%==0 (
    echo Netzwerk app-network erfolgreich erstellt.
) else (
    echo Netzwerk app-network existiert bereits.
)

echo.
echo Verbinde bestehende Container mit dem Netzwerk...
docker network connect app-network socialmedia-postgres 2>nul
docker network connect app-network socialmedia-neo4j 2>nul  
docker network connect app-network socialmedia-minio 2>nul

echo Setup abgeschlossen!
pause