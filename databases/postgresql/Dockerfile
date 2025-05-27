# PostgreSQL Dockerfile für Social Media App
FROM postgres:16-alpine

# Umgebungsvariablen für PostgreSQL
ENV POSTGRES_DB=socialmedia
ENV POSTGRES_USER=appuser
ENV POSTGRES_PASSWORD=apppassword

# Erstelle Verzeichnis für Initialisierungsskripte
RUN mkdir -p /docker-entrypoint-initdb.d

# Kopiere Initialisierungsskripte (falls vorhanden)
COPY init-scripts/ /docker-entrypoint-initdb.d/

# Installiere zusätzliche PostgreSQL Erweiterungen
RUN apk add --no-cache postgresql-contrib

# Setze das Arbeitsverzeichnis
WORKDIR /var/lib/postgresql/data

# Exponiere den Standard PostgreSQL Port
EXPOSE 5432

# Erstelle Volume für persistente Datenspeicherung
VOLUME ["/var/lib/postgresql/data"]

# Healthcheck für PostgreSQL
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# Nutze das Standard PostgreSQL Entrypoint
# Das alpine Image hat bereits das richtige Entrypoint konfiguriert