// frontend/src/levels/4IndividualLevel/ContentCreator.js
import React, { useState, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ContentType } from '../../types.ts';
import './ContentCreator.css';

const ContentCreator = ({ onSave, onCancel }) => {
  // Auth-Context für die Token-Verwaltung
  const { token, isAuthenticated } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    type: 'text',
    title: '',
    content: '',
    mediaUrl: null,
    thumbnailUrl: null,
    tags: [],
    aspectRatio: null
  });
  
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [useDirectService, setUseDirectService] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle media file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedMedia(file);
      
      // Automatically determine content type based on the file
      if (file.type.startsWith('image/')) {
        // Check if image is landscape or portrait
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width > img.height ? 'landscape' : 'portrait';
          setFormData({
            ...formData,
            type: `image-${aspectRatio}`,
            aspectRatio
          });
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, we'll need to check once uploaded or use metadata API
        setFormData({
          ...formData,
          type: 'video-landscape', // Default, will be updated after upload
        });
      } else if (file.type.startsWith('audio/')) {
        setFormData({
          ...formData,
          type: 'audio',
        });
      }
    }
  };
  
  // Handle media upload
  const handleMediaUpload = async () => {
    if (!selectedMedia) {
      return;
    }
    
    setUploadStatus('Datei wird hochgeladen...');
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('media', selectedMedia);
      
      // Authentifizierte API-URLs verwenden
      const useTestMode = false; // Test-Modus ist komplett deaktiviert
      
      // Standard-Pfad für Uploads über Gateway
      const uploadUrl = 'http://localhost:8000/api/media/content/upload-media';
        
      // Token aus AuthContext verwenden
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: token && !useTestMode ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) {
        throw new Error(`Upload fehlgeschlagen: ${response.status}`);
      }
      
      const result = await response.json();
      
      setUploadStatus('Datei erfolgreich hochgeladen');
      
      // Update form data with the media URL
      setFormData(prev => ({
        ...prev,
        mediaUrl: result.url,
      }));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Fehler: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setUploadStatus('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }
    
    setUploadStatus('Content wird erstellt...');
    setIsUploading(true);
    
    try {
      // Authentifizierte API-URLs verwenden
      const useTestMode = false; // Test-Modus ist komplett deaktiviert
      
      // Standard-Pfad für Content-Erstellung über Gateway
      const contentUrl = 'http://localhost:8000/api/media/content';
        
      // Token aus AuthContext verwenden
      const response = await fetch(contentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(!useTestMode && token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Content-Erstellung fehlgeschlagen: ${response.status}`);
      }
      
      const result = await response.json();
      setUploadStatus('Content erfolgreich erstellt');
      
      // Call the onSave function with the created content
      onSave(result.content);
      
    } catch (error) {
      console.error('Content creation error:', error);
      setUploadStatus(`Fehler: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Add tag to the list
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
        e.target.value = '';
      }
    }
  };
  
  // Remove tag from the list
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  return (
    <div className="content-creator">
      <h2>Neuen Inhalt erstellen</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Title field */}
        <div className="form-group">
          <label htmlFor="title">Titel*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        {/* Content field */}
        <div className="form-group">
          <label htmlFor="content">Inhalt*</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={5}
            required
          ></textarea>
        </div>
        
        {/* Content type selection */}
        <div className="form-group">
          <label htmlFor="type">Inhaltstyp</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="text">Text</option>
            <option value="image-landscape">Bild (Querformat)</option>
            <option value="image-portrait">Bild (Hochformat)</option>
            <option value="video-landscape">Video (Querformat)</option>
            <option value="video-portrait">Video (Hochformat)</option>
            <option value="audio">Audio</option>
            <option value="discussion">Diskussion</option>
          </select>
        </div>
        
        {/* Media upload section */}
        <div className="form-group media-upload">
          <label htmlFor="media">Medien-Upload</label>
          <input
            type="file"
            id="media"
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
          />
          
          {selectedMedia && (
            <div className="selected-media">
              <p>Ausgewählte Datei: {selectedMedia.name}</p>
              <button 
                type="button" 
                className="upload-button"
                onClick={handleMediaUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
              </button>
            </div>
          )}
        </div>
        
        {/* Tags input */}
        <div className="form-group">
          <label htmlFor="tags">Tags (Enter drücken zum Hinzufügen)</label>
          <input
            type="text"
            id="tags"
            onKeyDown={handleAddTag}
            placeholder="Tag eingeben und Enter drücken"
          />
          
          <div className="tags-container">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button 
                  type="button" 
                  className="remove-tag" 
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* API endpoint toggle for testing */}
        <div className="form-group api-toggle">
          <label>
            <input
              type="checkbox"
              checked={useDirectService}
              onChange={() => setUseDirectService(!useDirectService)}
            />
            Direkter MediaService-Zugriff (für Tests)
          </label>
          <small>
            {useDirectService 
              ? 'Verwendet http://localhost:3001 (direkt)' 
              : 'Verwendet http://localhost:8000/api/media (via Gateway)'}
          </small>
        </div>
        
        {/* Status message */}
        {uploadStatus && (
          <div className={`status-message ${uploadStatus.includes('erfolgreich') ? 'success' : uploadStatus.includes('Fehler') ? 'error' : ''}`}>
            {uploadStatus}
          </div>
        )}
        
        {/* Form buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isUploading}
          >
            Inhalt speichern
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentCreator;
