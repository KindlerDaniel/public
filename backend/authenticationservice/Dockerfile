FROM node:18-alpine

# Arbeitsverzeichnis
WORKDIR /usr/src/app

# Abhängigkeiten kopieren und installieren
COPY package.json package-lock.json ./
RUN npm install --production

# Restlichen Quellcode kopieren
COPY . .

# Port freigeben (z.B. 3000)
EXPOSE 3000

# Startkommando
CMD ["node", "server.js"]
