# Verwende das offizielle Node.js 18 Alpine Linux Base Image
FROM node:18-alpine

# Installiere Nginx, um das fertige React-Frontend später auszuliefern
RUN apk add --no-cache nginx

# Setze das Arbeitsverzeichnis für den Container auf /app
WORKDIR /app

# Kopiere die package.json- und package-lock.json-Dateien aus dem aktuellen Verzeichnis
# (Die package.json liegt jetzt in /app, nicht mehr in src)
COPY package*.json ./

# Installiere die Abhängigkeiten im Projekt
RUN npm install

# Exponiere den Standard-Nginx-Port 80, damit die Website im Browser erreichbar ist.
EXPOSE 80

# Kopiere das Entrypoint-Skript ins Image und mache es ausführbar.
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Starte das Entrypoint-Skript beim Container-Start.
CMD ["/entrypoint.sh"]
