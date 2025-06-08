@echo off
setlocal

set "ROOT=%~dp0"

echo ========================================
echo   SYSTEM WIRD VORBEREITET UND GESTARTET
echo ========================================
echo.

:: 1) Netzwerk anlegen
echo [1/7] Erstelle Docker-Netzwerk 'app-network'...
docker network create app-network 2>nul && echo ✓ Netzwerk erstellt. || echo ✓ Netzwerk existierte bereits.

echo.
:: 2) Datenbanken und MinIO starten
echo [2/7] Starte Datenbanken und MinIO...
rem Beachte: Service-Namen in docker-compose.yml sind 'postgres', 'neo4j' und 'socialmedia-minio'
docker-compose -f "%ROOT%databases\docker-compose.yml" up --build -d postgres neo4j socialmedia-minio
if %errorlevel% neq 0 (
  echo Ô£ô Fehler beim Starten der DB-Container.
) else (
  echo ✓ Datenbanken-Container werden gestartet.
)
echo ⏳ Warte auf Initialisierung (25s)...
timeout /t 25 /nobreak >nul

echo [2/7] Führe MinIO-Setup durch (Container wird nach Ausführung automatisch entfernt)...
docker-compose -f "%ROOT%databases\docker-compose.yml" run --rm minio-setup
echo ✓ MinIO initialisiert.

echo.
:: 3) Container mit Netzwerk verbinden
echo [3/7] Verbinde Dienste mit 'app-network'...
for %%C in (socialmedia-postgres socialmedia-neo4j socialmedia-minio) do (
  docker network connect app-network %%C 2>nul && echo ✓ %%C verbunden. || echo ✓ %%C war bereits verbunden oder existiert nicht.
)

echo.
:: 4) AuthService starten
echo [4/7] Starte AuthService...
docker-compose -f "%ROOT%backend\authservice\docker-compose.yml" up --build -d
echo ✓ AuthService läuft.

echo.
:: 5) API Gateway starten
echo [5/7] Starte API Gateway...
docker-compose -f "%ROOT%backend\gateway\docker-compose.yml" up --build -d
echo ✓ API Gateway läuft (http://localhost:8000).

echo.
:: 6) MediaService starten
echo [6/7] Starte MediaService...
docker-compose -f "%ROOT%backend\mediaservice\docker-compose.yml" up --build -d
echo ✓ MediaService läuft (http://localhost:3001).

echo.
:: 7) Frontend starten
echo [7/7] Starte Frontend...
docker-compose -f "%ROOT%frontend\docker-compose.yml" up --build -d
echo ✓ Frontend läuft (http://localhost:3000).

echo.
echo ========================================
echo   SYSTEM VOLLSTÄNDIG GESTARTET!
echo ========================================
echo   ✓ PostgreSQL:    localhost:5432
echo   ✓ Neo4j:         http://localhost:7474
echo   ✓ MinIO Admin:   http://localhost:9001
echo   ✓ AuthService:   http://localhost:4000
echo   ✓ API Gateway:   http://localhost:8000
echo   ✓ MediaService:  http://localhost:3001
echo   ✓ Frontend:      http://localhost:3000
endlocal
pause