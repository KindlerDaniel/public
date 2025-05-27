@echo off
echo ========================================
echo     MediaService wird gestartet...
echo ========================================
echo MediaService: http://localhost:3001
echo MinIO:        http://localhost:9000
echo MinIO UI:     http://localhost:9001
echo.

docker-compose -f backend/mediaservice/docker-compose.yml up --build

echo.
echo MediaService beendet.
pause