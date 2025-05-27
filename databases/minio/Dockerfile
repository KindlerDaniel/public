# MinIO Dockerfile für Social Media App (Object Storage)
FROM minio/minio:latest

# Umgebungsvariablen für MinIO
ENV MINIO_ROOT_USER=minioadmin
ENV MINIO_ROOT_PASSWORD=socialmedia123
ENV MINIO_BROWSER_REDIRECT_URL=http://localhost:9001

# Erstelle Datenverzeichnis (MinIO läuft als minio-user im Standard-Image)
RUN mkdir -p /data

# Setze Arbeitsverzeichnis
WORKDIR /data

# Exponiere MinIO Ports
# 9000: MinIO API
# 9001: MinIO Console (Web UI)
EXPOSE 9000 9001

# Volume für persistente Datenspeicherung
VOLUME ["/data"]

# Healthcheck für MinIO
HEALTHCHECK --interval=30s --timeout=20s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:9000/minio/health/live || exit 1

# Starte MinIO Server mit Console
CMD ["minio", "server", "/data", "--console-address", ":9001"]