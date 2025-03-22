#!/bin/sh
# Der Arbeitsordner ist bereits /app, wo package.json, src und public liegen

# Baue das React-Frontend (package.json enthält das "build"-Script)
npm run build

# Leere das aktuelle Nginx-Verzeichnis und kopiere den Build-Output hinein
rm -rf /usr/share/nginx/html/*
cp -r build/* /usr/share/nginx/html/

# Starte Nginx im Vordergrund
nginx -g 'daemon off;'

