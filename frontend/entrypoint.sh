#!/bin/sh
# Der Arbeitsordner ist bereits /app, wo package.json, src und public reingemounted wurden

echo "Aktuelles Arbeitsverzeichnisss:"
pwd

echo "Gemountete Ordnerstruktur:"
ls -R src public

# Baue das React-Frontend (package.json enthält das "build"-Script)
npm run build

# Stelle sicher, dass das Zielverzeichnis für Nginx existiert
mkdir -p /usr/share/nginx/html

# Leere das aktuelle Nginx-Verzeichnis und kopiere den Build-Output hinein
rm -rf /usr/share/nginx/html/*
cp -r build/* /usr/share/nginx/html/

# Starte Nginx im Vordergrund
nginx -g 'daemon off;'
