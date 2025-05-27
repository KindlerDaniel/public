@echo off
echo ========================================
echo    Datenbanken werden gestartet...
echo ========================================
echo PostgreSQL: http://localhost:5432
echo Neo4j:      http://localhost:7474
echo MinIO:      http://localhost:9001
echo.

docker-compose -f ./databases/docker-compose.yml up --build

echo.
echo Datenbanken beendet.
pause