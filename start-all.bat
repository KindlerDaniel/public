@echo off
setlocal

:: Basis-Pfad (Projekt-Root, dorthin kopiere dieses Skript)
set "ROOT=%~dp0"

echo ========================================
echo   SYSTEM WIRD VORBEREITET UND GESTARTET
echo ========================================
echo.

:: 1) Netzwerk anlegen
echo [1/6] Erstelle Docker-Netzwerk 'app-network'...
docker network create app-network 2>nul
if %errorlevel%==0 (
  echo ✓ Netzwerk erstellt.
) else (
  echo ✓ Netzwerk existierte bereits.
)

:: 2) Datenbanken starten
echo.
echo [2/6] Starte Datenbanken (Postgres, Neo4j, MinIO)...
docker-compose -f "%ROOT%databases\docker-compose.yml" up --build -d
echo ✓ Datenbanken-Container werden gestartet.
echo ⏳ Warte auf Initialisierung (25s)...
timeout /t 25 /nobreak >nul

:: 3) Container mit Netzwerk verbinden
echo.
echo [3/6] Verbinde Dienste mit 'app-network'...
for %%C in (socialmedia-minio socialmedia-postgres socialmedia-neo4j socialmedia-minio-setup) do (
  docker network connect app-network %%C 2>nul
  if %errorlevel%==0 (
    echo ✓ %%C verbunden.
  ) else (
    echo ✓ %%C war bereits verbunden oder existiert nicht.
  )
)

:: 4) API Gateway starten
echo.
echo [4/6] Starte API Gateway...
docker-compose -f "%ROOT%backend\gateway\docker-compose.yml" up --build -d
echo ✓ API Gateway läuft (http://localhost:8000).

:: 5) MediaService starten
echo.
echo [5/6] Starte MediaService...
docker-compose -f "%ROOT%backend\mediaservice\docker-compose.yml" up --build -d
echo ✓ MediaService läuft (http://localhost:3001).

:: 6) Frontend starten
echo.
echo [6/6] Starte Frontend...
docker-compose -f "%ROOT%frontend\docker-compose.yml" up --build -d
echo ✓ Frontend läuft (http://localhost:3000).

:: Übersicht
echo.
echo ========================================
echo   SYSTEM VOLLSTÄNDIG GESTARTET!
echo ========================================
echo.
echo   ✓ PostgreSQL:   localhost:5432
echo   ✓ Neo4j:        http://localhost:7474
echo   ✓ MinIO Admin:  http://localhost:9001
echo   ✓ API Gateway:  http://localhost:8000
echo   ✓ MediaService: http://localhost:3001
echo   ✓ Frontend:     http://localhost:3000
echo.
endlocal
pause
