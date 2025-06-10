@echo off
cd /d "%~dp0"

:: Clean up any setup containers
docker-compose -f docker-compose.yml down --rmi local

docker-compose down
docker-compose up -d --build
