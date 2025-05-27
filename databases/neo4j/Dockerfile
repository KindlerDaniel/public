# Neo4j Dockerfile für Social Media App - EINFACHE VERSION
FROM neo4j:5.15-community

# Nur die wichtigsten Umgebungsvariablen
ENV NEO4J_AUTH=neo4j/socialmedia123

# Aktiviere APOC Plugin
ENV NEO4J_PLUGINS='["apoc"]'

# APOC Sicherheit
ENV NEO4J_dbms_security_procedures_unrestricted=apoc.*

# Exponiere Neo4j Ports
EXPOSE 7474 7687

# Volumes für persistente Datenspeicherung
VOLUME ["/data", "/logs"]

# Das war's - keine komplizierten Konfigurationen mehr!