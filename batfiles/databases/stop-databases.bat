@echo off
echo Stoppe Datenbanken...

cd /d "%~dp0..\.."

docker-compose -f databases/docker-compose.yml down

echo ✓ Alle Datenbanken gestoppt.