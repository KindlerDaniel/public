@echo off
echo ========================================
echo     DATENBANKEN WERDEN GESTARTET...
echo ========================================
echo PostgreSQL: localhost:5432
echo Neo4j:      http://localhost:7474
echo MinIO:      http://localhost:9001
echo.

echo Current directory: %CD%
echo Script directory: %~dp0

cd /d "%~dp0..\.."
echo Changed to: %CD%

echo Running docker-compose...
docker-compose -f databases/docker-compose.yml up --build -d

echo.
echo ✓ Datenbanken werden im Hintergrund gestartet...
echo ⏳ PostgreSQL, Neo4j und MinIO benötigen einige Sekunden zum Initialisieren.
echo.
echo ✓ Datenbanken-Start abgeschlossen!