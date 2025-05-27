@echo off
echo ========================================
echo  Frontend + Datenbanken werden gestartet
echo ========================================
echo PostgreSQL: http://localhost:5432
echo Neo4j:      http://localhost:7474
echo MinIO:      http://localhost:9001
echo Frontend:   http://localhost:3000
echo.

echo [1/2] Starte Datenbanken...
docker-compose -f ./databases/docker-compose.yml up -d --build

echo.
echo [2/2] Warte bis Datenbanken bereit sind...
timeout /t 20 /nobreak >nul

echo Starte jetzt das Frontend...
docker-compose -f ./frontend/docker-compose.yml up --build

echo.
echo Frontend beendet. Datenbanken laufen weiter im Hintergrund.
echo Zum Stoppen aller Services: stop-all.bat
pause@echo off
echo ========================================
echo  Frontend + Datenbanken werden gestartet
echo ========================================
echo Frontend:   http://localhost:3000
echo PostgreSQL: http://localhost:5432
echo Neo4j:      http://localhost:7474
echo MinIO:      http://localhost:9001
echo.

docker-compose -f ./frontend/docker-compose.yml -f docker-compose.databases.yml up --build

echo.
echo Alle Services beendet.
pause