// frontend/src/levels/4IndividualLevel/IndividualLevelView.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './IndividualLevel.css';
import InlineLoginForm from '../../components/InlineLoginForm';
import InlineRegisterForm from '../../components/InlineRegisterForm';

const IndividualLevelView = () => {
  const [activeTab, setActiveTab] = useState(1); // Standardmäßig "Inhalte"-Tab

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [message, setMessage] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  // Toggle between login and register forms
  const toggleForms = () => {
    setShowRegisterForm(!showRegisterForm);
  };

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

  // Bilder beim Start laden
  React.useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="individual-level">
      <div className="auth-section">
        {isAuthenticated ? (
          <>
            <div className="tabs-header">
              <div className="tabs-nav">
                {['Auftritt', 'Inhalte', 'Folgen', 'Vertrauen', 'Follower'].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`tab-btn${activeTab === idx ? ' active' : ''}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {tab}
                  </button>
                ))}
                <span className="user-name" style={{marginLeft: 24, marginRight: 8}}>{user.name || user.email}</span>
                <button className="logout-modern" onClick={logout} aria-label="Logout">
                  <svg className="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="tab-content">
              {activeTab === 0 && (
                <div className="tab-panel">
                  <h3>Auftritt</h3>
                  <p>Hier kannst du deinen Auftritt verwalten. (Platzhalter)</p>
                </div>
              )}
              {activeTab === 1 && (
                <div className="tab-panel">
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
              )}
              {activeTab === 2 && (
                <div className="tab-panel">
                  <h3>Folgen</h3>
                  <p>Hier werden deine Folgen angezeigt. (Platzhalter)</p>
                </div>
              )}
              {activeTab === 3 && (
                <div className="tab-panel">
                  <h3>Vertrauen</h3>
                  <p>Hier siehst du Vertrauensinformationen. (Platzhalter)</p>
                </div>
              )}
              {activeTab === 4 && (
                <div className="tab-panel">
                  <h3>Follower</h3>
                  <p>Hier werden deine Follower angezeigt. (Platzhalter)</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                className={`auth-tab${!showRegisterForm ? ' active' : ''}`}
                onClick={() => setShowRegisterForm(false)}
                aria-pressed={!showRegisterForm}
                type="button"
              >
                ANMELDEN
              </button>
              <button
                className={`auth-tab${showRegisterForm ? ' active' : ''}`}
                onClick={() => setShowRegisterForm(true)}
                aria-pressed={showRegisterForm}
                type="button"
              >
                REGISTRIEREN
              </button>
            </div>
            <div className="auth-forms">
              {showRegisterForm ? <InlineRegisterForm /> : <InlineLoginForm />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IndividualLevelView;
