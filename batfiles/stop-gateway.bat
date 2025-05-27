@echo off
echo Stoppe API Gateway...

cd /d "%~dp0.."

docker-compose -f backend/gateway/docker-compose.yml down

echo ✓ API Gateway gestoppt.