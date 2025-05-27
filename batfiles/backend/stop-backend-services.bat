@echo off
echo Stoppe MediaService...

cd /d "%~dp0..\.."

docker-compose -f backend/mediaservice/docker-compose.yml down

echo ✓ MediaService gestoppt.