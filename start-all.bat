@echo off
setlocal

:: Basis-Pfad (Projekt-Root, dorthin kopiere dieses Skript)
set "ROOT=%~dp0"

echo ========================================
echo   SYSTEM WIRD VORBEREITET UND GESTARTET
echo ========================================
echo.

:: 1) Netzwerk anlegen
echo [1/7] Erstelle Docker-Netzwerk 'app-network'...
docker network create app-network 2>nul
if %errorlevel%==0 (
  echo ✓ Netzwerk erstellt.
) else (
  echo ✓ Netzwerk existierte bereits.
)

:: 2) Datenbanken starten
echo.
echo [2/7] Starte Datenbanken (Postgres, Neo4j, MinIO)...
docker-compose -f "%ROOT%databases\docker-compose.yml" up --build -d
echo ✓ Datenbanken-Container werden gestartet.
echo ⏳ Warte auf Initialisierung (25s)...
timeout /t 25 /nobreak >nul

:: 3) Container mit Netzwerk verbinden
echo.
echo [3/7] Verbinde bestehende Dienste mit 'app-network'...
for %%C in (socialmedia-minio socialmedia-postgres socialmedia-neo4j socialmedia-minio-setup) do (
  docker network connect app-network %%C 2>nul
  if %errorlevel%==0 (
    echo ✓ %%C verbunden.
  ) else (
    echo ✓ %%C war bereits verbunden oder existiert nicht.
  )
)

:: 4) AuthService starten
echo.
echo [4/7] Starte AuthService...
docker-compose -f "%ROOT%backend\authservice\docker-compose.yml" up --build -d
echo ✓ AuthService läuft.

:: 5) API Gateway starten
echo.
echo [5/7] Starte API Gateway...
docker-compose -f "%ROOT%backend\gateway\docker-compose.yml" up --build -d
echo ✓ API Gateway läuft (http://localhost:8000).

:: 6) MediaService starten
echo.
echo [6/7] Starte MediaService...
docker-compose -f "%ROOT%backend\mediaservice\docker-compose.yml" up --build -d
echo ✓ MediaService läuft (http://localhost:3001).

:: 7) Frontend starten
echo.
echo [7/7] Starte Frontend...
docker-compose -f "%ROOT%frontend\docker-compose.yml" up --build -d
echo ✓ Frontend läuft (http://localhost:3000).

:: Übersicht
echo.
echo ========================================
echo   SYSTEM VOLLSTÄNDIG GESTARTET!
echo ========================================
echo.
echo   ✓ PostgreSQL:    localhost:5432
echo   ✓ Neo4j:         http://localhost:7474
echo   ✓ MinIO Admin:   http://localhost:9001
echo   ✓ AuthService:   http://localhost:4000
echo   ✓ API Gateway:   http://localhost:8000
echo   ✓ MediaService:  http://localhost:3001
echo   ✓ Frontend:      http://localhost:3000
echo.
endlocal
pause
