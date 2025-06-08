# File: postgresql/Dockerfile
FROM postgres:16-alpine

ENV POSTGRES_DB=socialmedia \
    POSTGRES_USER=appuser
# POSTGRES_PASSWORD bleibt in der Compose

# Kopiere _alle_ Init-Skripte ins Image
COPY init-scripts/ /docker-entrypoint-initdb.d/

# (optional) zusätzliche Extensions
RUN apk add --no-cache postgresql-contrib

WORKDIR /var/lib/postgresql/data
EXPOSE 5432

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1
