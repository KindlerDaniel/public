@echo off
echo Stoppe Frontend...

cd /d "%~dp0..\.."

docker-compose -f frontend/docker-compose.yml down

echo ✓ Frontend gestoppt.