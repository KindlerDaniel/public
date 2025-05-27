@echo off
echo ========================================
echo    Alle Services werden gestoppt...
echo ========================================

echo Stoppe Frontend...
docker-compose -f ./frontend/docker-compose.yml down

echo Stoppe Datenbanken...
docker-compose -f ./databases/docker-compose.yml down

echo.
echo ========================================
echo     Alle Services gestoppt!
echo ========================================
pause