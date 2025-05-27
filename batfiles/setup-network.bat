@echo off
echo ========================================
echo    NETZWERK WIRD EINGERICHTET...
echo ========================================

echo [SETUP] Erstelle Docker-Netzwerk...
docker network create app-network 2>nul
if %errorlevel%==0 (
    echo ✓ Netzwerk app-network erfolgreich erstellt.
) else (
    echo ✓ Netzwerk app-network existiert bereits.
)

echo.
echo [SETUP] Bereinige alte Container...
docker container prune -f 2>nul

echo.
echo [SETUP] Überprüfe Docker-Images...
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | findstr socialmedia 2>nul
if %errorlevel% neq 0 (
    echo ⚠ Keine bestehenden Images gefunden - werden beim ersten Start erstellt.
) else (
    echo ✓ Bestehende Images gefunden.
)

echo.
echo [SETUP] Verbinde bestehende Container mit dem Netzwerk...
docker network connect app-network socialmedia-postgres 2>nul
docker network connect app-network socialmedia-neo4j 2>nul
docker network connect app-network socialmedia-minio 2>nul

echo.
echo ✓ Netzwerk-Setup abgeschlossen!
echo ========================================