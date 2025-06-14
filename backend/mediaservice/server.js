// backend/mediaservice/server.js
const express = require('express');
const multer = require('multer');
const Minio = require('minio');
const cors = require('cors');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3001;

// CORS konfigurieren
app.use(cors());
app.use(express.json());

// MinIO Client konfigurieren
const minioClient = new Minio.Client({
  endPoint: 'socialmedia-minio',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'socialmedia123'
});

// Postgres DB-Verbindung
const sequelize = new Sequelize(
  process.env.DB_NAME || 'socialmedia',
  process.env.DB_USER || 'appuser',
  process.env.DB_PASSWORD || 'mediaservice123',  // Passwort aus docker-compose.yml
  { 
    host: process.env.DB_HOST || 'socialmedia-postgres',
    dialect: 'postgres',
    logging: false
  }
);

// JWT-Geheimnis (muss mit dem Auth-Service übereinstimmen)
const JWT_SECRET = process.env.JWT_SECRET || 'geheimeschluessel';

// Content Model
const ContentItem = sequelize.define('ContentItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  authorId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  thumbnailUrl: { type: DataTypes.TEXT },
  mediaUrl: { type: DataTypes.TEXT },
  audioUrl: { type: DataTypes.TEXT },
  duration: { type: DataTypes.STRING(10) },
  ratings: { 
    type: DataTypes.JSONB, 
    defaultValue: { beauty: 0, wisdom: 0, humor: 0 } 
  },
  tags: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  question: { type: DataTypes.TEXT },
  discussion: { type: DataTypes.JSONB },
  aspectRatio: { type: DataTypes.STRING(20) },
  dimensions: { type: DataTypes.JSONB }
}, {
  tableName: 'ContentItems',
  timestamps: true
});

// Multer für File Upload konfigurieren
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Authentifizierungs-Middleware
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (authError) {
      console.error('Token-Verifizierungsfehler:', authError);
      return res.status(401).json({ error: 'Ungültiges Token' });
    }
  } catch (error) {
    console.error('Auth-Middleware Error:', error);
    return res.status(500).json({ error: 'Authentifizierungsfehler' });
  }
};

// File-Upload-Hilfsfunktion
async function uploadFileToMinio(file, bucketName, customFileName = null) {
  const fileName = customFileName || `${Date.now()}-${file.originalname}`;
  
  // Prüfen ob Bucket existiert
  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }

  // Datei zu MinIO hochladen
  await minioClient.putObject(
    bucketName,
    fileName,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );

  const fileUrl = `http://localhost:9000/${bucketName}/${fileName}`;
  return { fileName, url: fileUrl };
}

// Bucket für den Dateityp ermitteln
function getBucketForContentType(contentType) {
  if (contentType.includes('video')) return 'videos';
  if (contentType.includes('image')) return 'images';
  if (contentType === 'audio') return 'audios';
  return 'other';
}

// BESTEHENDE ENDPUNKTE

// Bild hochladen
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const bucketName = 'images';

    // Prüfen ob Bucket existiert
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Datei zu MinIO hochladen
    await minioClient.putObject(
      bucketName,
      fileName,
      req.file.buffer,
      req.file.size,
      {
        'Content-Type': req.file.mimetype
      }
    );

    const fileUrl = `http://localhost:9000/${bucketName}/${fileName}`;

    res.json({
      message: 'Bild erfolgreich hochgeladen',
      fileName: fileName,
      url: fileUrl
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen' });
  }
});

// Bild löschen
app.delete('/delete/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const bucketName = 'images';

    await minioClient.removeObject(bucketName, fileName);

    res.json({
      message: 'Bild erfolgreich gelöscht',
      fileName: fileName
    });

  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// Alle Bilder auflisten
app.get('/list', async (req, res) => {
  try {
    const bucketName = 'images';
    const objectsList = [];

    const stream = minioClient.listObjects(bucketName, '', true);
    
    stream.on('data', (obj) => {
      objectsList.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        url: `http://localhost:9000/${bucketName}/${obj.name}`
      });
    });

    stream.on('end', () => {
      res.json(objectsList);
    });

    stream.on('error', (err) => {
      res.status(500).json({ error: 'Fehler beim Auflisten' });
    });

  } catch (error) {
    console.error('List Error:', error);
    res.status(500).json({ error: 'Fehler beim Auflisten' });
  }
});

// NEUE CONTENT-ENDPUNKTE

// Media-Datei für ContentItem hochladen (erfordert Authentifizierung) - unterstützt beide Pfadvarianten
app.post('/content/upload-media', verifyToken, upload.single('media'), async (req, res) => {
  // Original-Handler
  handleMediaUpload(req, res);
});

// Zusätzlicher Endpunkt für vollständigen Pfad von Kong
app.post('/api/media/content/upload-media', verifyToken, upload.single('media'), async (req, res) => {
  // Weiterleitung zum Original-Handler
  console.log('Upload-Request erhalten an /api/media/content/upload-media');
  handleMediaUpload(req, res);
});

// TEST-Endpunkt für Media-Upload ohne Auth-Prüfung - NUR ZUR FEHLERBEHEBUNG
app.post('/api/media/content/upload-test', upload.single('media'), async (req, res) => {
  console.log('Upload-TEST-Request erhalten');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    // Bucket bestimmen basierend auf Dateityp
    let bucketName;
    if (req.file.mimetype.startsWith('image/')) {
      bucketName = 'images';
    } else if (req.file.mimetype.startsWith('video/')) {
      bucketName = 'videos';
    } else if (req.file.mimetype.startsWith('audio/')) {
      bucketName = 'audios';
    } else {
      bucketName = 'others';
    }

    // Sicherstellen, dass der Bucket existiert
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }

    // Datei speichern
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const fileUrl = await uploadFileToMinio(req.file, bucketName, fileName);

    res.status(201).json({
      message: 'Datei erfolgreich hochgeladen',
      fileUrl: fileUrl,
      fileName: fileName,
      fileType: req.file.mimetype
    });
  } catch (error) {
    console.error('Fehler beim Media-Upload:', error);
    res.status(500).json({ error: 'Serverfehler beim Media-Upload' });
  }
});

// Gemeinsame Funktion für Media-Upload
async function handleMediaUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    // Bucket bestimmen basierend auf Dateityp
    let bucketName;
    if (req.file.mimetype.startsWith('image/')) {
      bucketName = 'images';
    } else if (req.file.mimetype.startsWith('video/')) {
      bucketName = 'videos';
    } else if (req.file.mimetype.startsWith('audio/')) {
      bucketName = 'audios';
    } else {
      return res.status(400).json({ error: 'Nicht unterstützter Dateityp' });
    }

    const result = await uploadFileToMinio(req.file, bucketName);

    res.json({
      message: 'Datei erfolgreich hochgeladen',
      fileName: result.fileName,
      url: result.url,
      type: req.file.mimetype,
      bucket: bucketName
    });

  } catch (error) {
    console.error('Media Upload Error:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen der Mediendatei' });
  }
}

// ContentItem erstellen (erfordert Authentifizierung) - unterstützt beide Pfadvarianten
app.post('/content', verifyToken, async (req, res) => {
  // Original-Handler
  handleContentCreation(req, res);
});

// Zusätzlicher Endpunkt für vollständigen Pfad von Kong
app.post('/api/media/content', verifyToken, async (req, res) => {
  // Weiterleitung zum Original-Handler
  handleContentCreation(req, res);
});

// TEST-Endpunkt ohne Auth-Prüfung - NUR ZUR FEHLERBEHEBUNG
app.post('/api/media/content/test', async (req, res) => {
  try {
    const contentData = req.body;
    
    // Validierung
    if (!contentData.title || !contentData.content || !contentData.type) {
      return res.status(400).json({ error: 'Titel, Inhalt und Typ sind erforderlich' });
    }

    // Fester Test-Author
    const authorId = contentData.authorId || 1;
    
    // ContentItem erstellen
    const newContent = await ContentItem.create({
      ...contentData,
      authorId,
      date: new Date()
    });

    res.status(201).json({
      message: 'Content erfolgreich erstellt',
      content: newContent
    });
  } catch (error) {
    console.error('Fehler bei Content-Erstellung:', error);
    res.status(500).json({ error: 'Serverfehler bei Content-Erstellung' });
  }
});

// Gemeinsame Funktion für Content-Erstellung
async function handleContentCreation(req, res) {
  try {
    const contentData = req.body;
    
    // Validierung
    if (!contentData.title || !contentData.content || !contentData.type) {
      return res.status(400).json({ error: 'Titel, Inhalt und Typ sind erforderlich' });
    }

    // Autor aus Token ermitteln
    const authorId = req.user.userId;
    
    // ContentItem erstellen
    const newContent = await ContentItem.create({
      ...contentData,
      authorId,
      date: new Date()
    });

    res.status(201).json({
      message: 'Content erfolgreich erstellt',
      content: newContent
    });

  } catch (error) {
    console.error('Content Creation Error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Content-Items' });
  }
}

// ContentItem abrufen
app.get('/content/:id', async (req, res) => {
  try {
    const contentId = req.params.id;
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content nicht gefunden' });
    }

    res.json(content);

  } catch (error) {
    console.error('Content Fetch Error:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Content-Items' });
  }
});

// Alle ContentItems abrufen
app.get('/content', async (req, res) => {
  try {
    const { type, authorId, limit = 20, offset = 0 } = req.query;
    
    const whereClause = {};
    if (type) whereClause.type = type;
    if (authorId) whereClause.authorId = authorId;
    
    const contents = await ContentItem.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    res.json(contents);

  } catch (error) {
    console.error('Content List Error:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Content-Items' });
  }
});

// ContentItem aktualisieren (erfordert Authentifizierung)
app.put('/content/:id', verifyToken, async (req, res) => {
  try {
    const contentId = req.params.id;
    const updateData = req.body;
    const userId = req.user.userId;
    
    // ContentItem finden
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content nicht gefunden' });
    }
    
    // Prüfen, ob der Benutzer der Autor ist
    if (content.authorId !== userId) {
      return res.status(403).json({ error: 'Nicht berechtigt diesen Content zu bearbeiten' });
    }
    
    // Aktualisieren, aber authorId nicht ändern lassen
    delete updateData.authorId;
    await content.update(updateData);
    
    res.json({
      message: 'Content erfolgreich aktualisiert',
      content
    });

  } catch (error) {
    console.error('Content Update Error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Content-Items' });
  }
});

// ContentItem löschen (erfordert Authentifizierung)
app.delete('/content/:id', verifyToken, async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user.userId;
    
    // ContentItem finden
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content nicht gefunden' });
    }
    
    // Prüfen, ob der Benutzer der Autor ist oder Admin-Rechte hat
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (content.authorId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Nicht berechtigt diesen Content zu löschen' });
    }
    
    // Content löschen
    await content.destroy();
    
    // Falls vorhanden, auch die Medien aus MinIO löschen
    if (content.mediaUrl) {
      try {
        const bucket = getBucketForContentType(content.type);
        const fileName = path.basename(content.mediaUrl);
        await minioClient.removeObject(bucket, fileName);
      } catch (err) {
        console.error('Fehler beim Löschen der Mediendatei:', err);
      }
    }
    
    if (content.thumbnailUrl) {
      try {
        const fileName = path.basename(content.thumbnailUrl);
        await minioClient.removeObject('thumbnails', fileName);
      } catch (err) {
        console.error('Fehler beim Löschen des Thumbnails:', err);
      }
    }
    
    res.json({
      message: 'Content erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('Content Delete Error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Content-Items' });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mediaservice' });
});

// Datenbank synchronisieren und Server starten
sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`MediaService läuft auf Port ${port}`);
      console.log('Datenbank erfolgreich synchronisiert');
    });
  })
  .catch(err => {
    console.error('Fehler beim Synchronisieren der Datenbank:', err);
  });