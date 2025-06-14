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
  try {
    console.log(`Uploading file to MinIO bucket: ${bucketName}`);
    const fileName = customFileName || `${Date.now()}-${file.originalname}`;
    
    // Prüfen ob Bucket existiert
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} does not exist, creating it...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} created successfully`);
      
      // Set bucket policy to public (for easy access in dev environment)
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      
      try {
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`Public read policy set for bucket ${bucketName}`);
      } catch (policyErr) {
        console.error(`Error setting bucket policy: ${policyErr.message}`);
      }
    }

    // Datei zu MinIO hochladen
    await minioClient.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );

    console.log(`File ${fileName} uploaded successfully to bucket ${bucketName}`);
    const fileUrl = `http://localhost:9000/${bucketName}/${fileName}`;
    return { fileName, url: fileUrl };
  } catch (err) {
    console.error(`Error in uploadFileToMinio: ${err.message}`);
    throw new Error(`Failed to upload file to storage: ${err.message}`);
  }
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
  console.log('TEST-Upload-Request erhalten an /api/media/content/upload-test');
  try {
    if (!req.file) {
      console.log('TEST-Upload: Keine Datei erhalten');
      return res.status(400).json({ 
        error: 'Keine Datei hochgeladen',
        info: 'Dies ist ein Test-Endpunkt ohne Authentifizierung'
      });
    }

    console.log(`TEST-Upload: Datei erhalten: ${req.file.originalname}, Größe: ${req.file.size}, Typ: ${req.file.mimetype}`);
    
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
      console.log(`TEST-Upload: Nicht kategorisierter Dateityp: ${req.file.mimetype}`);
    }

    console.log(`TEST-Upload: Verwende Bucket: ${bucketName}`);
    
    // Datei speichern (nutze die verbesserte uploadFileToMinio Funktion)
    const fileName = `test-${Date.now()}-${req.file.originalname}`;
    const result = await uploadFileToMinio(req.file, bucketName, fileName);
    console.log(`TEST-Upload: Datei erfolgreich hochgeladen: ${fileName}`);
    
    res.status(201).json({
      message: 'Test-Datei erfolgreich hochgeladen',
      fileName: result.fileName,
      url: result.url,
      type: req.file.mimetype,
      bucket: bucketName,
      note: 'Dies ist ein Test-Upload ohne Authentifizierung'
    });
  } catch (error) {
    console.error(`TEST-Upload Fehler: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Serverfehler beim Test-Media-Upload',
      details: error.message,
      info: 'Bitte überprüfen Sie die Server-Logs für weitere Details'
    });
  }
});

// Gemeinsame Funktion für Media-Upload
async function handleMediaUpload(req, res) {
  try {
    console.log(`Media upload request received: ${req.path}`);
    
    // Validate request
    if (!req.file) {
      console.log('Upload request received with no file');
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }
    
    console.log(`File received: ${req.file.originalname}, size: ${req.file.size}, type: ${req.file.mimetype}`);

    // Bucket bestimmen basierend auf Dateityp
    let bucketName;
    if (req.file.mimetype.startsWith('image/')) {
      bucketName = 'images';
    } else if (req.file.mimetype.startsWith('video/')) {
      bucketName = 'videos';
    } else if (req.file.mimetype.startsWith('audio/')) {
      bucketName = 'audios';
    } else {
      console.log(`Unsupported file type: ${req.file.mimetype}`);
      return res.status(400).json({ error: 'Nicht unterstützter Dateityp' });
    }

    // Upload file to MinIO
    const result = await uploadFileToMinio(req.file, bucketName);
    console.log(`File successfully uploaded to MinIO: ${result.fileName}`);

    // Send success response
    res.status(201).json({
      message: 'Datei erfolgreich hochgeladen',
      fileName: result.fileName,
      url: result.url,
      type: req.file.mimetype,
      bucket: bucketName
    });

  } catch (error) {
    console.error(`Media Upload Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Hochladen der Mediendatei',
      details: error.message
    });
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

// TEST-Endpunkt für Content-Erstellung ohne Auth-Prüfung - NUR ZUR FEHLERBEHEBUNG
app.post('/api/media/content/test', async (req, res) => {
  console.log('TEST-Content-Request erhalten an /api/media/content/test');
  try {
    const contentData = req.body;
    
    console.log('TEST-Content: Erhaltene Daten:', JSON.stringify(contentData, null, 2));
    
    // Erweiterte Validierung
    const requiredFields = ['title', 'content', 'type'];
    const missingFields = requiredFields.filter(field => !contentData[field]);
    
    if (missingFields.length > 0) {
      console.log(`TEST-Content: Validierungsfehler - fehlende Felder: ${missingFields.join(', ')}`);
      return res.status(400).json({
        error: 'Validierungsfehler',
        details: `Folgende Felder sind erforderlich: ${missingFields.join(', ')}`,
        info: 'Dies ist ein Test-Endpunkt ohne Authentifizierung'
      });
    }
    
    // Gültige Content-Typen prüfen
    const validContentTypes = [
      'text', 'image-landscape', 'image-portrait', 'video-landscape',
      'video-portrait', 'audio', 'discussion'
    ];
    
    if (!validContentTypes.includes(contentData.type)) {
      console.log(`TEST-Content: Ungültiger Content-Typ: ${contentData.type}`);
      return res.status(400).json({
        error: 'Ungültiger Content-Typ',
        validTypes: validContentTypes,
        info: 'Dies ist ein Test-Endpunkt ohne Authentifizierung'
      });
    }

    // Fester Test-Author
    const authorId = contentData.authorId || 1;
    console.log(`TEST-Content: Verwende Test-Autor ID: ${authorId}`);
    
    // ContentItem erstellen
    const newContent = await ContentItem.create({
      ...contentData,
      authorId,
      date: new Date()
    });

    console.log(`TEST-Content: Item erfolgreich erstellt mit ID: ${newContent.id}`);
    res.status(201).json({
      message: 'Test-Content erfolgreich erstellt',
      content: newContent,
      note: 'Dies ist ein Test-Content ohne Authentifizierung'
    });
  } catch (error) {
    console.error(`TEST-Content Fehler: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Serverfehler bei Content-Erstellung', 
      details: error.message,
      info: 'Bitte überprüfen Sie die Server-Logs für weitere Details'
    });
  }
});

// Gemeinsame Funktion für Content-Erstellung
async function handleContentCreation(req, res) {
  try {
    console.log(`Content creation request received: ${req.path}`);
    const contentData = req.body;
    
    console.log('Content data received:', JSON.stringify(contentData, null, 2));
    
    // Erweiterte Validierung
    const requiredFields = ['title', 'content', 'type'];
    const missingFields = requiredFields.filter(field => !contentData[field]);
    
    if (missingFields.length > 0) {
      console.log(`Validation failed - missing fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        error: 'Validierungsfehler',
        details: `Folgende Felder sind erforderlich: ${missingFields.join(', ')}`
      });
    }
    
    // Gültige Content-Typen prüfen
    const validContentTypes = [
      'text', 'image-landscape', 'image-portrait', 'video-landscape',
      'video-portrait', 'audio', 'discussion'
    ];
    
    if (!validContentTypes.includes(contentData.type)) {
      console.log(`Invalid content type: ${contentData.type}`);
      return res.status(400).json({
        error: 'Ungültiger Content-Typ',
        validTypes: validContentTypes
      });
    }

    // Autor aus Token ermitteln
    const authorId = req.user.userId;
    console.log(`Creating content for author ID: ${authorId}`);
    
    // ContentItem erstellen
    const newContent = await ContentItem.create({
      ...contentData,
      authorId,
      date: new Date()
    });

    console.log(`Content successfully created with ID: ${newContent.id}`);
    res.status(201).json({
      message: 'Content erfolgreich erstellt',
      content: newContent
    });

  } catch (error) {
    console.error(`Content Creation Error: ${error.message}`, error);
    res.status(500).json({
      error: 'Fehler beim Erstellen des Content-Items',
      details: error.message
    });
  }
}

// ContentItem abrufen - direkte Route
app.get('/content/:id', async (req, res) => {
  try {
    console.log(`Content-Abruf-Request für ID ${req.params.id} an /content/:id`);
    const contentId = req.params.id;
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      console.log(`Content mit ID ${contentId} nicht gefunden`);
      return res.status(404).json({ error: 'Content nicht gefunden' });
    }

    res.json(content);

  } catch (error) {
    console.error(`Content Fetch Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen des Content-Items',
      details: error.message 
    });
  }
});

// ContentItem abrufen - Kong Gateway Route
app.get('/api/media/content/:id', async (req, res) => {
  try {
    console.log(`Content-Abruf-Request für ID ${req.params.id} an /api/media/content/:id`);
    const contentId = req.params.id;
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      console.log(`Content mit ID ${contentId} nicht gefunden`);
      return res.status(404).json({ error: 'Content nicht gefunden' });
    }

    res.json(content);

  } catch (error) {
    console.error(`Content Fetch Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen des Content-Items',
      details: error.message 
    });
  }
});

// Alle ContentItems abrufen - direkte Route
app.get('/content', async (req, res) => {
  try {
    console.log('Content-Liste-Request an /content');
    const { type, authorId, limit = 20, offset = 0 } = req.query;
    
    console.log(`Filter: Typ=${type || 'alle'}, AutorID=${authorId || 'alle'}, Limit=${limit}, Offset=${offset}`);
    
    const whereClause = {};
    if (type) whereClause.type = type;
    if (authorId) whereClause.authorId = authorId;
    
    const contents = await ContentItem.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    console.log(`${contents.length} ContentItems gefunden`);
    res.json(contents);

  } catch (error) {
    console.error(`Content List Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Content-Items',
      details: error.message
    });
  }
});

// Alle ContentItems abrufen - Kong Gateway Route
app.get('/api/media/content', async (req, res) => {
  try {
    console.log('Content-Liste-Request an /api/media/content');
    const { type, authorId, limit = 20, offset = 0 } = req.query;
    
    console.log(`Filter: Typ=${type || 'alle'}, AutorID=${authorId || 'alle'}, Limit=${limit}, Offset=${offset}`);
    
    const whereClause = {};
    if (type) whereClause.type = type;
    if (authorId) whereClause.authorId = authorId;
    
    const contents = await ContentItem.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    console.log(`${contents.length} ContentItems gefunden`);
    res.json(contents);

  } catch (error) {
    console.error(`Content List Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Content-Items',
      details: error.message
    });
  }
});

// ContentItem aktualisieren - direkte Route
app.put('/content/:id', verifyToken, async (req, res) => {
  handleContentUpdate(req, res);
});

// ContentItem aktualisieren - Kong Gateway Route
app.put('/api/media/content/:id', verifyToken, async (req, res) => {
  handleContentUpdate(req, res);
});

// ContentItem Löschfunktion - gemeinsam genutzt von beiden Routen
async function handleContentDeletion(req, res) {
  try {
    console.log(`Content-Lösch-Request für ID ${req.params.id} an ${req.path}`);
    const contentId = req.params.id;
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      console.log(`Löschen fehlgeschlagen: Content mit ID ${contentId} nicht gefunden`);
      return res.status(404).json({ 
        error: 'Content nicht gefunden',
        message: 'Der angeforderte Content existiert nicht oder wurde bereits gelöscht'
      });
    }

    // Prüfen, ob Benutzer Autor ist oder Admin-Rechte hat
    if (content.authorId !== req.user.userId && req.user.role !== 'admin') {
      console.log(`Löschen verweigert: Benutzer ${req.user.userId} ist nicht Autor (${content.authorId}) und kein Admin`);
      return res.status(403).json({ 
        error: 'Keine Berechtigung',
        message: 'Sie sind nicht berechtigt, diesen Content zu löschen' 
      });
    }

    // Content aus der DB löschen
    await content.destroy();
    console.log(`Content mit ID ${contentId} erfolgreich gelöscht`);
    
    res.json({ 
      message: 'Content erfolgreich gelöscht',
      contentId: contentId
    });
  } catch (error) {
    console.error(`Content Delete Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Löschen des Content-Items',
      details: error.message
    });
  }
}

// ContentItem löschen - direkte Route
app.delete('/content/:id', verifyToken, async (req, res) => {
  handleContentDeletion(req, res);
});

// ContentItem löschen - Kong Gateway Route
app.delete('/api/media/content/:id', verifyToken, async (req, res) => {
  handleContentDeletion(req, res);
});

// TEST-Endpunkt für Content-Löschung ohne Auth-Prüfung - NUR ZUR FEHLERBEHEBUNG
app.delete('/api/media/content/test/:id', async (req, res) => {
  try {
    console.log(`TEST-Lösch-Request für Content ID ${req.params.id}`);
    const contentId = req.params.id;
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      console.log(`TEST-Löschen: Content mit ID ${contentId} nicht gefunden`);
      return res.status(404).json({ 
        error: 'Content nicht gefunden',
        info: 'Dies ist ein Test-Endpunkt ohne Authentifizierung'
      });
    }

    await content.destroy();
    console.log(`TEST-Löschen: Content mit ID ${contentId} erfolgreich gelöscht`);
    
    res.json({ 
      message: 'Test-Content erfolgreich gelöscht', 
      contentId: contentId,
      note: 'Dies ist ein Test-Endpunkt ohne Authentifizierung'
    });
  } catch (error) {
    console.error(`TEST-Löschen Fehler: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Serverfehler beim Löschen des Test-Contents',
      details: error.message,
      info: 'Dies ist ein Test-Endpunkt ohne Authentifizierung'
    });
  }
});

// ContentItem aktualisieren - gemeinsame Funktion
async function handleContentUpdate(req, res) {
  try {
    console.log(`Content-Update-Request für ID ${req.params.id} an ${req.path}`);
    const contentId = req.params.id;
    const updateData = req.body;
    const userId = req.user.userId;
    
    console.log(`Update-Daten erhalten: ${JSON.stringify(updateData, null, 2)}`);
    
    // ContentItem finden
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      console.log(`Update fehlgeschlagen: Content mit ID ${contentId} nicht gefunden`);
      return res.status(404).json({ 
        error: 'Content nicht gefunden',
        message: 'Der zu aktualisierende Content existiert nicht'
      });
    }
    
    // Prüfen, ob der Benutzer der Autor ist
    if (content.authorId !== userId) {
      console.log(`Update verweigert: Benutzer ${userId} ist nicht Autor (${content.authorId})`);
      return res.status(403).json({ 
        error: 'Keine Berechtigung',
        message: 'Sie sind nicht berechtigt, diesen Content zu bearbeiten'
      });
    }
    
    // Aktualisieren, aber authorId nicht ändern lassen
    delete updateData.authorId;
    await content.update(updateData);
    console.log(`Content mit ID ${contentId} erfolgreich aktualisiert`);
    
    res.json({
      message: 'Content erfolgreich aktualisiert',
      content
    });
  } catch (error) {
    console.error(`Content Update Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Aktualisieren des Content-Items',
      details: error.message 
    });
  }
}

// ContentItem löschen - Funktion
async function handleContentDeletion(req, res) {
  try {
    console.log(`Content-Lösch-Request für ID ${req.params.id} an ${req.path}`);
    const contentId = req.params.id;
    const content = await ContentItem.findByPk(contentId);
    
    if (!content) {
      console.log(`Löschen fehlgeschlagen: Content mit ID ${contentId} nicht gefunden`);
      return res.status(404).json({ 
        error: 'Content nicht gefunden',
        message: 'Der angeforderte Content existiert nicht oder wurde bereits gelöscht'
      });
    }

    // Prüfen, ob Benutzer Autor ist oder Admin-Rechte hat
    const isAdmin = req.user.role === 'admin' || (req.user.roles && req.user.roles.includes('admin'));
    if (content.authorId !== req.user.userId && !isAdmin) {
      console.log(`Löschen verweigert: Benutzer ${req.user.userId} ist nicht Autor (${content.authorId}) und kein Admin`);
      return res.status(403).json({ 
        error: 'Keine Berechtigung',
        message: 'Sie sind nicht berechtigt, diesen Content zu löschen' 
      });
    }

    // Content aus der DB löschen
    await content.destroy();
    console.log(`Content mit ID ${contentId} erfolgreich gelöscht`);
    
    // Falls vorhanden, auch die Medien aus MinIO löschen
    if (content.mediaUrl) {
      try {
        const bucket = content.type.startsWith('image') ? 'images' : 
                      content.type.startsWith('video') ? 'videos' : 
                      content.type.startsWith('audio') ? 'audios' : 'others';
        const fileName = content.mediaUrl.split('/').pop();
        
        console.log(`Versuche zugehörige Mediendatei zu löschen: Bucket=${bucket}, Datei=${fileName}`);
        await minioClient.removeObject(bucket, fileName);
        console.log(`Mediendatei erfolgreich gelöscht`);
      } catch (err) {
        console.error(`Fehler beim Löschen der Mediendatei: ${err.message}`, err);
      }
    }
    
    res.json({ 
      message: 'Content erfolgreich gelöscht',
      contentId: contentId
    });
  } catch (error) {
    console.error(`Content Delete Error: ${error.message}`, error);
    res.status(500).json({ 
      error: 'Fehler beim Löschen des Content-Items',
      details: error.message
    });
  }
}

// Health Check - Basisroute
app.get('/health', async (req, res) => {
  try {
    console.log('Health-Check-Request an /health');
    // DB-Verbindung prüfen
    await sequelize.authenticate();
    
    // MinIO-Verbindung prüfen
    let minioStatus = 'ok';
    try {
      await minioClient.listBuckets();
    } catch (minioError) {
      console.error('MinIO Error:', minioError);
      minioStatus = 'error';
    }
    
    res.json({ 
      status: 'ok', 
      service: 'mediaservice',
      timestamp: new Date().toISOString(),
      database: 'connected',
      storage: minioStatus,
      version: '1.1.0'
    });
  } catch (error) {
    console.error(`Health Check Error: ${error.message}`, error);
    res.status(500).json({ 
      status: 'error', 
      service: 'mediaservice',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Health Check - Kong Gateway Route
app.get('/api/media/health', async (req, res) => {
  try {
    console.log('Health-Check-Request an /api/media/health');
    // DB-Verbindung prüfen
    await sequelize.authenticate();
    
    // MinIO-Verbindung prüfen
    let minioStatus = 'ok';
    try {
      await minioClient.listBuckets();
    } catch (minioError) {
      console.error('MinIO Error:', minioError);
      minioStatus = 'error';
    }
    
    res.json({ 
      status: 'ok', 
      service: 'mediaservice',
      timestamp: new Date().toISOString(),
      database: 'connected',
      storage: minioStatus,
      version: '1.1.0'
    });
  } catch (error) {
    console.error(`Health Check Error: ${error.message}`, error);
    res.status(500).json({ 
      status: 'error', 
      service: 'mediaservice',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Datenbank synchronisieren und Server starten
sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log('===========================================');
      console.log(`MediaService läuft auf Port ${port}`);
      console.log('===========================================');
      console.log('Verfügbare Endpunkte:');
      console.log('  - Direkt:');
      console.log('    * POST /content - Content erstellen (Auth erforderlich)');
      console.log('    * POST /content/upload-media - Media hochladen (Auth erforderlich)');
      console.log('    * GET /content - Alle Content-Items abrufen');
      console.log('    * GET /content/:id - Einzelnes Content-Item abrufen');
      console.log('  - Über Kong Gateway:');
      console.log('    * POST /api/media/content - Content erstellen (Auth erforderlich)');
      console.log('    * POST /api/media/content/upload-media - Media hochladen (Auth erforderlich)');
      console.log('    * GET /api/media/content - Alle Content-Items abrufen');
      console.log('    * GET /api/media/content/:id - Einzelnes Content-Item abrufen');
      console.log('  - Test-Endpunkte (keine Auth erforderlich):');
      console.log('    * POST /api/media/content/test - Test Content erstellen');
      console.log('    * POST /api/media/content/upload-test - Test Media hochladen');
      console.log('  - Health Checks:');
      console.log('    * GET /health');
      console.log('    * GET /api/media/health');
      console.log('===========================================');
      console.log('Datenbank erfolgreich synchronisiert');
    });
  })
  .catch(err => {
    console.error('Fehler beim Synchronisieren der Datenbank:', err);
    console.error('Server konnte nicht gestartet werden!');
    process.exit(1);
  });