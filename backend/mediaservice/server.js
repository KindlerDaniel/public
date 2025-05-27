// backend/mediaservice/server.js
const express = require('express');
const multer = require('multer');
const Minio = require('minio');
const cors = require('cors');

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

// Multer für File Upload konfigurieren
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mediaservice' });
});

app.listen(port, () => {
  console.log(`MediaService läuft auf Port ${port}`);
});