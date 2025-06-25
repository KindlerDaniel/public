import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import './MyContents.css';
import CustomFeed from './CustomFeed';
import { AuthContext } from '../../context/AuthContext';

// Debug helper function: Prints important information about a content object
const debugContentObject = (content, index) => {
  try {
    console.log(`------ Content #${index} Debug ------`);
    console.log(`ID: ${content?.id || 'Not defined'}`);
    console.log(`Title: ${content?.title || 'Not defined'}`);
    console.log(`Type: ${content?.type || 'Not defined'}`);
    console.log(`MediaURL: ${content?.mediaUrl || 'Not defined'}`);
    console.log(`Content: ${typeof content?.content === 'string' ? content.content.substring(0, 50) + '...' : 'No text content'}`);
    console.log('--------------------------------');
  } catch (error) {
    console.error('Error during debug logging:', error);
  }
};

// Helper function: Converts MinIO URLs - but NO longer converts to gateway URLs!
const convertToAuthenticatedMediaUrl = (url, token) => {
  // Check if url is a string
  if (!url || typeof url !== 'string') {
    console.log('URL is not a string:', url);
    return url;
  }
  
  // Debug information for URL processing
  console.log(`URL is no longer converted, using direct MinIO URL: ${url}`);
  
  // IMPORTANT: Use direct access to MinIO without gateway!
  // The MediaService creates URLs with localhost:9000 that work directly
  // We don't need to convert anything here anymore!
  return url;
  
  /* The old conversion (no longer used):
  try {
    if (url.includes('localhost:9000')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      if (pathParts.length >= 3) {
        const bucket = pathParts[1];
        const fileName = pathParts.slice(2).join('/');
        
        if (token && typeof token === 'string') {
          return `http://localhost:8000/api/media/file/${bucket}/${fileName}?token=${token}`;
        } else {
          return `http://localhost:8000/api/media/file/${bucket}/${fileName}`;
        }
      }
    }
  } catch (error) {
    console.error('Error converting media URL:', error);
  }
  */
};

const MyContents = () => {
  // Auth context for token management and user data
  const { token, isAuthenticated, user } = useContext(AuthContext);
  
  // Content display state
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [width, setWidth] = useState(500); // Standardbreite wie im Original-Feed
  const [isDragging, setIsDragging] = useState(false);
  const feedRef = useRef(null);
  const resizeHandleRef = useRef(null);
  
  // Define constants for min and max width
  const minWidth = 250;
  const maxWidth = 700;
  
  // Content creation state (aus ContentCreator übernommen)
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
  const [isUploading, setIsUploading] = useState(false);
  
  // Function to reset form data
  const clearFormData = () => {
    setFormData({
      type: 'text',
      title: '',
      content: '',
      mediaUrl: null,
      thumbnailUrl: null,
      tags: [],
      aspectRatio: null
    });
    setSelectedMedia(null);
  };

  // Load all contents for this user
  const loadContents = useCallback(async () => {
    // Check if the user is authenticated
    if (!isAuthenticated || !token) {
      setMessage('Please log in to view your content.');
      return;
    }
    
    // Kein Ladehinweis mehr anzeigen - stattdessen nur den Spinner
    try {
      // Authentifizierter API-Aufruf mit Bearer-Token
      const response = await fetch('http://localhost:8000/api/media/content', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we received an array or an object with contents property
      if (Array.isArray(data)) {
        // Konvertieren aller MinIO-URLs zu authentifizierten URLs
        const processedData = data.map(convertToAuthenticatedMediaUrl);
        setContents(processedData);
        setLoading(false); // Loading-Status beenden
        
        // Feedback-Message setzen
        if (processedData.length === 0) {
          setMessage(''); // Keine Nachricht mehr anzeigen
        } else {
          setMessage('');
          console.log('Medieninhalte mit authentifizierten URLs geladen:', processedData);
        }
      } else if (data.contents && Array.isArray(data.contents)) {
        // Konvertieren aller MinIO-URLs zu authentifizierten URLs
        const processedData = data.contents.map(convertToAuthenticatedMediaUrl);
        setContents(processedData);
        setLoading(false); // Loading-Status beenden
        
        // Feedback-Message setzen
        if (processedData.length === 0) {
          setMessage(''); // Keine Nachricht mehr anzeigen
        } else {
          setMessage('');
          console.log('Medieninhalte mit authentifizierten URLs geladen:', processedData);
        }
      } else {
        console.error('Unexpected data format:', data);
        setContents([]);
        setLoading(false); // Loading-Status beenden
        setMessage('No content available - unexpected data format');
      }
    } catch (error) {
      console.error('Load contents error:', error);
      setLoading(false); // Loading-Status beenden auch bei Fehler
      setMessage(`Error loading content: ${error.message}`);
    }
  }, [isAuthenticated, token, setContents, setLoading, setMessage]);

  useEffect(() => {
    loadContents();
  }, [isAuthenticated, token, loadContents]);

  // Content Creation functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Direkter DOM-Update ohne React State zu ändern
    e.target.value = value;
    
    // Warten, bis Event abgeschlossen ist, bevor State aktualisiert wird
    setTimeout(() => {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }, 10);
  };
  
  // Handle file selection for upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Datei in den State setzen
      setSelectedMedia(file);
      
      // Temporäre URL erstellen für Vorschau während des Uploads
      const tempUrl = URL.createObjectURL(file);
      let fileType = 'text';
      
      // Automatische Erkennung des Typs basierend auf der Datei
      if (file.type.startsWith('image/')) {
        // Für Bilder das Seitenverhältnis bestimmen
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width > img.height ? 'landscape' : 'portrait';
          fileType = `image-${aspectRatio}`;
          
          // Formular-Daten aktualisieren mit Typ und temporärer URL
          setFormData(prevData => ({
            ...prevData,
            type: fileType,
            aspectRatio: aspectRatio,
            mediaUrl: tempUrl  // Temporäre URL verwenden bis Upload abgeschlossen ist
          }));
          
          // Upload-Prozess starten
          handleMediaUpload(file);
        };
        img.src = tempUrl;
      } else if (file.type.startsWith('video/')) {
        fileType = 'video-landscape';
        setFormData(prevData => ({
          ...prevData,
          type: fileType,
          mediaUrl: tempUrl
        }));
        handleMediaUpload(file);
      } else if (file.type.startsWith('audio/')) {
        fileType = 'audio';
        setFormData(prevData => ({
          ...prevData,
          type: fileType,
          mediaUrl: tempUrl
        }));
        handleMediaUpload(file);
      }
      
      console.log('Datei ausgewählt:', file.name, 'Typ:', fileType, 'Temp-URL:', tempUrl);
    }
  };

  // Handle media upload
  const handleMediaUpload = async (fileToUpload) => {
    // Verwende entweder die übergebene Datei oder die aus dem State
    const mediaFile = fileToUpload || selectedMedia;
    
    if (!mediaFile) {
      console.error('Keine Datei zum Hochladen angegeben');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('media', mediaFile);
      
      // Standard-Pfad für Uploads über Gateway
      const uploadUrl = 'http://localhost:8000/api/media/content/upload-media';
        
      console.log('Datei wird hochgeladen...', mediaFile.name);
      
      // Token aus AuthContext verwenden
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataObj,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) {
        throw new Error(`Upload fehlgeschlagen: ${response.status}`);
      }
      
      const result = await response.json();
      
      // WICHTIG: Die Original-MinIO-URL DIREKT aus der Server-Antwort verwenden
      console.log('Upload erfolgreich. Media-URL vom Server:', result.url);
      
      // Temporäre URL freigeben, wenn vorhanden
      if (formData.mediaUrl && formData.mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.mediaUrl);
        console.log('Temporäre Blob-URL freigegeben');
      }
      
      // FormData mit der permanenten Server-URL aktualisieren
      setFormData(prevData => {
        const updatedData = {
          ...prevData,
          mediaUrl: result.url
        };
        console.log('FormData nach Upload-Update:', updatedData);
        return updatedData;
      });
      
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
      // Bei Fehler die temporäre URL beibehalten
    } finally {
      setIsUploading(false);
    }
  };
  
  // Funktion zum Entfernen der ausgewählten Mediendatei
  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setFormData(prevData => ({
      ...prevData,
      mediaUrl: null,
      aspectRatio: null
    }));
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there's any content at all (title, content text, or media)
    if (!formData.title && !formData.content && !formData.mediaUrl) {
      console.warn('Es muss mindestens ein Titel, Inhalt oder Medien vorhanden sein');
      return;
    }
    
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
      
      // Inhalt erfolgreich erstellt
      // Formular zurücksetzen
      clearFormData();
      handleSaveContent(result.content);
      
    } catch (error) {
      console.error('Fehler beim Erstellen des Inhalts:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handler for saving new content items
  const handleSaveContent = (newContent) => {
    // Reset form data after submission
    clearFormData();
    
    // Close content creator
    setShowContentCreator(false);
    
    // Don't show success message anymore
    setMessage('');
    
    // Short delay for backend processing
    setTimeout(() => {
      // Reload all contents to get current server state
      loadContents();
    }, 1000);
  };

  // Handler for canceling content creation
  const handleCancelContentCreation = () => {
    setShowContentCreator(false);
    clearFormData();
  };

  // Sets the CSS variable for initial width and on changes
  useEffect(() => {
    document.documentElement.style.setProperty('--feed-width', `${width}px`);
    if (feedRef.current) {
      feedRef.current.style.width = `${width}px`;
    }
  }, [width]);
  
  // Resize handle functionality - following the pattern from FeedArea.tsx
  const handleResizeStart = (e) => {
    e.preventDefault(); // Prevents text selection during drag
    setIsDragging(true);
  };
  
  // Effect for handling mouse dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && feedRef.current) {
        const newWidth = e.clientX;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
          document.documentElement.style.setProperty('--feed-width', `${newWidth}px`);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth]);

  // Helper-Funktion, um den Content-Typ als Text darzustellen
  const formatType = (type) => {
    switch(type) {
      case 'text': return 'Text';
      case 'image-landscape': return 'Bild';
      case 'image-portrait': return 'Bild';
      case 'video-landscape': return 'Video';
      case 'video-portrait': return 'Video';
      case 'audio': return 'Audio';
      case 'discussion': return 'Diskussion';
      default: return 'Inhalt';
    }
  };
  
  // Komponente für die große Vorschau mit integrierten Bearbeitungsfeldern
  const LargePreviewComponent = () => {
    // Nur anzeigen, wenn Content Creator aktiv ist
    if (!showContentCreator) {
      return null;
    }
    
    return (
      <div className="large-preview-container">
        {/* Vorschau des Contents mit integrierten Eingabefeldern */}
        <div className="large-preview-content">
          {formData.type.includes('image-landscape') && (
            <div className={`large-preview-item ${formData.type}`}>
              <div className="media-container landscape large">
                {formData.mediaUrl && (
                  <img src={formData.mediaUrl} alt={formData.title || ''} className="large-preview-media" />
                )}
              </div>
              <div className="content-form large">
                <div className="form-group normal-form-group">
                  <input
                    type="text"
                    name="title"
                    defaultValue={formData.title}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        title: e.target.value
                      }));
                    }}
                    required
                    className="normal-input title-input"
                    placeholder="Titel eingeben..."
                  />
                </div>
                <div className="form-group normal-form-group">  
                  <textarea
                    name="content"
                    defaultValue={formData.content}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        content: e.target.value
                      }));
                    }}
                    required
                    className="normal-input content-input"
                    placeholder="Inhalt eingeben..."
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          {formData.type.includes('image-portrait') && (
            <div className={`large-preview-item ${formData.type}`}>
              <div className="media-container portrait large">
                {formData.mediaUrl && (
                  <img src={formData.mediaUrl} alt={formData.title || ''} className="large-preview-media" />
                )}
              </div>
              <div className="content-form large">
                <div className="form-group normal-form-group">
                  <input
                    type="text"
                    name="title"
                    defaultValue={formData.title}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        title: e.target.value
                      }));
                    }}
                    required
                    className="normal-input title-input"
                    placeholder="Titel eingeben..."
                  />
                </div>
                <div className="form-group normal-form-group">  
                  <textarea
                    name="content"
                    defaultValue={formData.content}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        content: e.target.value
                      }));
                    }}
                    required
                    className="normal-input content-input"
                    placeholder="Inhalt eingeben..."
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          {formData.type.includes('video-landscape') && (
            <div className={`large-preview-item ${formData.type}`}>
              <div className="media-container landscape large">
                {formData.mediaUrl && (
                  <video src={formData.mediaUrl} controls className="large-preview-media">Ihr Browser unterstützt keine Videos.</video>
                )}
              </div>
              <div className="content-form large">
                <div className="form-group normal-form-group">
                  <input
                    type="text"
                    name="title"
                    defaultValue={formData.title}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        title: e.target.value
                      }));
                    }}
                    required
                    className="normal-input title-input"
                    placeholder="Titel eingeben..."
                  />
                </div>
                <div className="form-group normal-form-group">  
                  <textarea
                    name="content"
                    defaultValue={formData.content}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        content: e.target.value
                      }));
                    }}
                    required
                    className="normal-input content-input"
                    placeholder="Inhalt eingeben..."
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          {formData.type.includes('video-portrait') && (
            <div className={`large-preview-item ${formData.type}`}>
              <div className="media-container portrait large">
                {formData.mediaUrl && (
                  <video src={formData.mediaUrl} controls className="large-preview-media">Ihr Browser unterstützt keine Videos.</video>
                )}
              </div>
              <div className="content-form large">
                <div className="form-group normal-form-group">
                  <input
                    type="text"
                    name="title"
                    defaultValue={formData.title}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        title: e.target.value
                      }));
                    }}
                    required
                    className="normal-input title-input"
                    placeholder="Titel eingeben..."
                  />
                </div>
                <div className="form-group normal-form-group">  
                  <textarea
                    name="content"
                    defaultValue={formData.content}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        content: e.target.value
                      }));
                    }}
                    required
                    className="normal-input content-input"
                    placeholder="Inhalt eingeben..."
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          {formData.type.includes('audio') && (
            <div className="large-preview-item audio">
              <div className="content-form large">
                <div className="form-group normal-form-group">
                  <input
                    type="text"
                    name="title"
                    defaultValue={formData.title}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        title: e.target.value
                      }));
                    }}
                    required
                    className="normal-input title-input"
                    placeholder="Titel eingeben..."
                  />
                </div>
              </div>
              <div className="audio-container large">
                {formData.mediaUrl && (
                  <audio src={formData.mediaUrl} controls className="large-preview-media">Ihr Browser unterstützt keine Audio-Dateien.</audio>
                )}
              </div>
              <div className="content-form large">
                <div className="form-group normal-form-group">  
                  <textarea
                    name="content"
                    defaultValue={formData.content}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        content: e.target.value
                      }));
                    }}
                    required
                    className="normal-input content-input"
                    placeholder="Inhalt eingeben..."
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          {formData.type === 'text' && (
            <div className="large-preview-item text-only">
              <div className="content-form large">
                <div className="form-group normal-form-group">
                  <input
                    type="text"
                    name="title"
                    defaultValue={formData.title}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        title: e.target.value
                      }));
                    }}
                    required
                    className="normal-input title-input"
                    placeholder="Titel eingeben..."
                  />
                </div>
                <div className="form-group normal-form-group">  
                  <textarea
                    name="content"
                    defaultValue={formData.content}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        content: e.target.value
                      }));
                    }}
                    required
                    className="normal-input content-input"
                    placeholder="Inhalt eingeben..."
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          {formData.type === 'discussion' && (
            <div className="large-preview-item discussion">
              <div className="content-form large">
                <div className="form-group normal-form-group">
                  <input
                    type="text"
                    name="title"
                    defaultValue={formData.title}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        title: e.target.value
                      }));
                    }}
                    required
                    className="normal-input title-input"
                    placeholder="Titel eingeben..."
                  />
                </div>
                <div className="form-group normal-form-group">  
                  <textarea
                    name="content"
                    defaultValue={formData.content}
                    onBlur={(e) => {
                      setFormData(prev => ({
                        ...prev, 
                        content: e.target.value
                      }));
                    }}
                    required
                    className="normal-input content-input"
                    placeholder="Inhalt eingeben..."
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <>
      {/* Plus-Button für die Content-Erstellung */}
      <button 
        className={`create-content-fixed-button ${contents.length > 0 ? 'has-content' : 'no-content'}`}
        onClick={() => setShowContentCreator(!showContentCreator)}
        aria-label={showContentCreator ? 'Schließen' : 'Neuen Inhalt erstellen'}
      >
        {showContentCreator ? '×' : '+'}
      </button>
      
      {/* Die große Vorschau wird direkt im content-creator-layout gerendert */}
      
      {/* Loading indicator was moved to the feed container */}
          
      {/* Status message always visible */}
      {message && (
        <div className="message-overlay">
          <span className={message.includes('successful') ? 'success' : 'error'}>
            {message}
          </span>
        </div>
      )}

      {/* Main area - always show content feed */}
      {!loading && (contents.length > 0 || showContentCreator) && (
        <div 
          className="direct-feed-container"
          ref={feedRef}
          style={{ width: width > window.innerWidth - 70 ? `${window.innerWidth - 70}px` : `${width}px` }}
        >
          {/* Resize handle */}
          <div 
            className="feed-resize-handle"
            ref={resizeHandleRef}
            onMouseDown={handleResizeStart}
          >
            <div className="handle-line"></div>
          </div>

          {/* Integrated Content Creation */}
          {showContentCreator && (
            <div className="content-creator-layout">
              {/* Linke Seite: Eingabeformular für Typ und Media */}
              <div className="integrated-content-creator">
                <form onSubmit={handleSubmit}>
                  {/* Live Preview - ContentCard Style - nur anzeigen wenn es Inhalte gibt */}
                  {(formData.title || formData.content || formData.mediaUrl) && (
                    <div className="content-preview">
                      {formData.type.includes('image-landscape') && (
                        <div className={`preview-container ${formData.type}`}>
                        <div className="media-container landscape">
                          {formData.mediaUrl && (
                            <img src={formData.mediaUrl} alt={formData.title || ''} className="preview-media" />
                          )}
                        </div>
                        <div className="content-text">
                          {formData.title && <h3>{formData.title}</h3>}
                          {formData.content && <p>{formData.content}</p>}
                        </div>
                      </div>
                    )}
                    {formData.type.includes('image-portrait') && (
                      <div className={`preview-container ${formData.type}`}>
                        <div className="media-container portrait">
                          {formData.mediaUrl && (
                            <img src={formData.mediaUrl} alt={formData.title || ''} className="preview-media" />
                          )}
                        </div>
                        <div className="content-text">
                          {formData.title && <h3>{formData.title}</h3>}
                          {formData.content && <p>{formData.content}</p>}
                        </div>
                      </div>
                    )}
                    {formData.type.includes('video-landscape') && (
                      <div className={`preview-container ${formData.type}`}>
                        <div className="media-container landscape">
                          {formData.mediaUrl && (
                            <video src={formData.mediaUrl} controls className="preview-media">Ihr Browser unterstützt keine Videos.</video>
                          )}
                        </div>
                        <div className="content-text">
                          {formData.title && <h3>{formData.title}</h3>}
                          {formData.content && <p>{formData.content}</p>}
                        </div>
                      </div>
                    )}
                    {formData.type.includes('video-portrait') && (
                      <div className={`preview-container ${formData.type}`}>
                        <div className="media-container portrait">
                          {formData.mediaUrl && (
                            <video src={formData.mediaUrl} controls className="preview-media">Ihr Browser unterstützt keine Videos.</video>
                          )}
                        </div>
                        <div className="content-text">
                          {formData.title && <h3>{formData.title}</h3>}
                          {formData.content && <p>{formData.content}</p>}
                        </div>
                      </div>
                    )}
                    {formData.type.includes('audio') && (
                      <div className="preview-container audio">
                        <div className="content-text">
                          {formData.title && <h3>{formData.title}</h3>}
                        </div>
                        <div className="audio-container">
                          {formData.mediaUrl && (
                            <audio src={formData.mediaUrl} controls className="preview-media">Ihr Browser unterstützt keine Audio-Dateien.</audio>
                          )}
                        </div>
                        {formData.content && <p>{formData.content}</p>}
                      </div>
                    )}
                    {formData.type === 'text' && (
                      <div className="preview-container text-only">
                        <div className="content-text">
                          {formData.title && <h3>{formData.title}</h3>}
                          {formData.content && <p>{formData.content}</p>}
                        </div>
                      </div>
                    )}
                    {formData.type === 'discussion' && (
                      <div className="preview-container discussion">
                        <div className="content-text">
                          {formData.title && <h3>{formData.title}</h3>}
                          {formData.content && <p>{formData.content}</p>}
                        </div>
                      </div>
                    )}
                    </div>
                  )}
                  
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
                    {!selectedMedia ? (
                      <div className="upload-file-container">
                        <label htmlFor="media" className="upload-file-area">
                          <span className="upload-text">Upload File</span>
                          <input
                            type="file"
                            id="media"
                            accept="image/*,video/*,audio/*"
                            onChange={handleFileSelect}
                            style={{display: 'none'}}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="selected-media-container">
                        <div className="file-info">
                          {isUploading ? (
                            <div className="upload-loading">
                              <div className="upload-spinner"></div>
                              <p className="file-name">{selectedMedia.name}</p>
                            </div>
                          ) : (
                            <p className={`file-name ${formData.mediaUrl ? 'upload-success' : ''}`}>{selectedMedia.name}</p>
                          )}
                        </div>
                        {!isUploading && (
                          <div className="remove-button-container">
                            <button 
                              type="button" 
                              className="remove-media-button" 
                              onClick={handleRemoveMedia}
                              aria-label="Mediendatei entfernen"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Leerraum für bessere Optik */}
                  <div className="form-group-spacer"></div>
                  
                  {/* Tags wurden entfernt */}
                  
                  {/* Leerraum für bessere Optik */}
                  <div className="form-group-spacer"></div>
                  
                  {/* Form buttons */}
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={handleCancelContentCreation}
                    >
                      Abbrechen
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isUploading}
                    >
                      {formatType(formData.type)} erstellen
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Rechte Seite: Große Vorschau mit Titel- und Inhalt-Eingabefeldern */}
              <LargePreviewComponent />
            </div>
          )}
          
          {/* Content Cards Display */}
          {!showContentCreator && contents.length > 0 && (
            <CustomFeed
              compact={true}
              customContents={contents.map((content, index) => {
                // Debug of original content
                debugContentObject(content, index);
                
                console.log('Processing content:', content);
                
                // IMPORTANT: Determine the correct URL for media content (images etc.)
                let mediaUrl = null;
                
                // Improved type detection - multiple ways to recognize an image type
                const contentType = (content?.type || '').toLowerCase();
                const mimeType = (content?.mimeType || '').toLowerCase();
                const fileType = (content?.fileType || '').toLowerCase();
                
                // Detects image types through multiple fields
                const isImage = contentType.includes('image') || 
                                mimeType.includes('image') || 
                                fileType.includes('image') || 
                                (content?.fileName || '').match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i);
                
                const isVideo = contentType.includes('video') || 
                                mimeType.includes('video') || 
                                fileType.includes('video') || 
                                (content?.fileName || '').match(/\.(mp4|webm|avi|mov|wmv)$/i);
                
                const isAudio = contentType.includes('audio') || 
                                mimeType.includes('audio') || 
                                fileType.includes('audio') || 
                                (content?.fileName || '').match(/\.(mp3|wav|ogg|aac)$/i);
                
                console.log(`Content #${index}: Type detection:`, { 
                  contentType, mimeType, fileType, 
                  isImage, isVideo, isAudio 
                });
                
                // Option 1: Explicit mediaUrl from content object
                if (typeof content?.mediaUrl === 'string' && content.mediaUrl.trim() !== '') {
                  mediaUrl = content.mediaUrl;
                  console.log(`Content #${index}: Using explicit mediaUrl: ${mediaUrl}`);
                }
                // Option 2: For image types - url field might exist
                else if (isImage && typeof content?.url === 'string' && content.url.trim() !== '') {
                  mediaUrl = content.url;
                  console.log(`Content #${index}: Using url field as mediaUrl: ${mediaUrl}`);
                }
                // Option 3: Specific field 'path' might exist
                else if (typeof content?.path === 'string' && content.path.trim() !== '') {
                  mediaUrl = content.path;
                  console.log(`Content #${index}: Using path field as mediaUrl: ${mediaUrl}`);
                }
                // Option 4: For image types - content field might be a URL
                else if (isImage && 
                    typeof content?.content === 'string' && 
                    (content.content.startsWith('http://') || 
                     content.content.startsWith('https://') || 
                     content.content.startsWith('/') ||
                     content.content.includes('minio') ||
                     content.content.includes('localhost'))) {
                  mediaUrl = content.content;
                  console.log(`Content #${index}: Using content as mediaUrl: ${mediaUrl}`);
                }
                
                // Fix URL if relative
                if (mediaUrl && mediaUrl.startsWith('/')) {
                  mediaUrl = `http://localhost:8000${mediaUrl}`;
                  console.log(`Content #${index}: Converted relative URL to absolute URL: ${mediaUrl}`);
                }
                
                // Convert URL if it's a MinIO URL
                if (typeof mediaUrl === 'string' && 
                    (mediaUrl.includes('localhost:9000') || mediaUrl.includes('minio'))) {
                  const originalUrl = mediaUrl;
                  mediaUrl = convertToAuthenticatedMediaUrl(mediaUrl, token);
                  console.log(`Content #${index}: URL converted from ${originalUrl} to ${mediaUrl} (With Token: ${!!token})`);
                }
                
                // Debug output for detected mediaUrl before creating ContentItem
                console.log(`Content #${index} finale mediaUrl:`, mediaUrl);
                
                // Create a ContentItem with NO placeholders and NO default values
                const contentItem = {
                  // Convert id to number if it's a string, otherwise generate temporary ID
                  id: content?.id ? (typeof content.id === 'string' ? parseInt(content.id, 10) || index + 1 : content.id) : index + 1,
                  // Only include title if it exists
                  ...(content?.title ? { title: content.title } : {}),
                  // Only include content text if it exists and it's not a media type
                  ...(!isImage && !isVideo && !isAudio && content?.content ? { content: content.content } : {}),
                  // Only include mediaUrl if it exists - NO placeholders
                  ...(mediaUrl ? { mediaUrl } : {}),
                  // Set type correctly based on extended detection
                  type: isImage ? 'image-landscape' : 
                        isVideo ? 'video-landscape' : 
                        isAudio ? 'audio' : 'text',
                  // Add missing required properties for ContentItem
                  authorId: content?.authorId || 0,
                  ratings: content?.ratings || { beauty: 0, wisdom: 0, humor: 0 },
                  date: content?.createdAt || content?.date || new Date().toISOString(),
                  createdAt: content?.createdAt || content?.date || new Date().toISOString(),
                  updatedAt: content?.updatedAt || content?.date || new Date().toISOString(),
                  author: { name: content?.author?.name || user?.username || '' }
                };
                
                console.log(`Content #${index} finales ContentItem:`, contentItem);
                return contentItem;
              })
              // Only show items that have actual content (title, text or media)
              .filter(item => item.title || item.content || item.mediaUrl)}
              onSelectContent={() => {}} // No action on selection
            />
          )}
        </div>
      )}
    </>
  );
};

export default MyContents;
