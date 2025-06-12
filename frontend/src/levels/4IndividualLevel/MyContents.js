import React, { useState, useEffect } from 'react';
import './MyContents.css';

const MyContents = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [message, setMessage] = useState('');

  // Datei auswählen
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Bitte wählen Sie eine Bilddatei aus.');
      setSelectedFile(null);
    }
  };

  // Bild hochladen
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Bitte wählen Sie erst eine Datei aus.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:8000/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Bild erfolgreich hochgeladen!');
        setSelectedFile(null);
        document.getElementById('fileInput').value = '';
        loadImages();
      } else {
        setMessage(result.error || 'Fehler beim Hochladen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Verbindungsfehler beim Hochladen');
    } finally {
      setUploading(false);
    }
  };

  // Bilder laden
  const loadImages = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/media/list');
      const images = await response.json();

      if (response.ok) {
        setUploadedImages(images);
      }
    } catch (error) {
      console.error('Load images error:', error);
    }
  };

  // Bild löschen
  const handleDelete = async (fileName) => {
    try {
      const response = await fetch(`http://localhost:8000/api/media/delete/${fileName}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Bild erfolgreich gelöscht!');
        loadImages();
      } else {
        setMessage(result.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Verbindungsfehler beim Löschen');
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="tab-panel mycontents-panel">
      {/* Upload-Bereich */}
      <div className="upload-section">
        <h3>Bild hochladen</h3>
        <div className="upload-controls">
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          {selectedFile && (
            <div className="selected-file">
              <p>Ausgewählt: {selectedFile.name}</p>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="upload-button"
              >
                {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
              </button>
            </div>
          )}
        </div>
        {message && (
          <div className={`message ${message.includes('erfolgreich') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
      {/* Bilder-Galerie */}
      <div className="images-section">
        <h3>Meine Bilder ({uploadedImages.length})</h3>
        {uploadedImages.length > 0 ? (
          <div className="images-grid">
            {uploadedImages.map((image, index) => (
              <div key={index} className="image-card">
                <img src={image.url} alt={image.name} />
                <div className="image-info">
                  <p className="image-name">{image.name}</p>
                  <button
                    onClick={() => handleDelete(image.name)}
                    className="delete-button"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-images">Noch keine Bilder hochgeladen.</p>
        )}
      </div>
    </div>
  );
};

export default MyContents;
