import React, { useState, useEffect, useContext, useRef } from 'react';
import './MyContents.css';
import ContentCreator from './ContentCreator';
import './ContentCreator.css';
import Feed from '../1SocietyLevel/ContentView/Feed.tsx';
import { AuthContext } from '../../context/AuthContext';

// Debug-Hilfsfunktion: Druckt wichtige Informationen über ein Content-Objekt
const debugContentObject = (content, index) => {
  try {
    console.log(`------ Content #${index} Debug ------`);
    console.log(`ID: ${content?.id || 'Nicht definiert'}`);
    console.log(`Titel: ${content?.title || 'Nicht definiert'}`);
    console.log(`Typ: ${content?.type || 'Nicht definiert'}`);
    console.log(`MediaURL: ${content?.mediaUrl || 'Nicht definiert'}`);
    console.log(`Content: ${typeof content?.content === 'string' ? content.content.substring(0, 50) + '...' : 'Kein textlicher Inhalt'}`);
    console.log('--------------------------------');
  } catch (error) {
    console.error('Fehler beim Debug-Log:', error);
  }
};

// Hilfsfunktion: Konvertiert MinIO URLs - aber NICHT mehr in Gateway-URLs umwandeln!
const convertToAuthenticatedMediaUrl = (url, token) => {
  // Überprüfe ob url ein String ist
  if (!url || typeof url !== 'string') {
    console.log('URL ist kein String:', url);
    return url;
  }
  
  // Debug-Information zur URL-Verarbeitung
  console.log(`URL wird nicht mehr konvertiert, verwende direkte MinIO-URL: ${url}`);
  
  // WICHTIG: Direkten Zugriff auf MinIO verwenden ohne Gateway!
  // Der MediaService erstellt URLs mit localhost:9000, die direkt funktionieren
  // Wir müssen hier nichts mehr umwandeln!
  return url;
  
  /* Die alte Konvertierung (nicht mehr verwendet):
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
    console.error('Fehler beim Konvertieren der Media-URL:', error);
  }
  */
};

// Konvertiert alle mediaUrls in einem Content-Objekt
const convertContentMediaUrls = (content, token) => {
  if (!content) return content;
  
  // Kopiere das Original-Objekt
  const updatedContent = {...content};
  
  // Konvertiere mediaUrl wenn vorhanden und hänge Token an
  if (updatedContent.mediaUrl) {
    updatedContent.mediaUrl = convertToAuthenticatedMediaUrl(updatedContent.mediaUrl, token);
  }
  
  return updatedContent;
};

const MyContents = () => {
  // Auth-Context für die Token-Verwaltung und Benutzerdaten
  const { token, isAuthenticated, user } = useContext(AuthContext);
  
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [width, setWidth] = useState(500); // Standardbreite wie im Original-Feed
  const [isDragging, setIsDragging] = useState(false);
  const feedRef = useRef(null);
  const resizeHandleRef = useRef(null);

  // Content-Items laden
  const loadContents = async () => {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!isAuthenticated || !token) {
      setMessage('Bitte melden Sie sich an, um Ihre Inhalte zu sehen.');
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
      
      // Prüfen, ob wir ein Array oder ein Objekt mit contents-Property bekommen
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
        console.error('Unerwartetes Datenformat:', data);
        setContents([]);
        setLoading(false); // Loading-Status beenden
        setMessage('Keine Inhalte verfügbar - unerwartetes Datenformat');
      }
    } catch (error) {
      console.error('Load contents error:', error);
      setLoading(false); // Loading-Status beenden auch bei Fehler
      setMessage(`Fehler beim Laden der Inhalte: ${error.message}`);
    }
  };

  useEffect(() => {
    loadContents();
  }, [isAuthenticated, token]);

  // Handler für das Speichern von neuen Content-Items
  const handleSaveContent = (newContent) => {
    // Content Creator schließen
    setShowContentCreator(false);
    
    // Keine Erfolgsmeldung mehr anzeigen
    setMessage('');
    
    // Kurze Verzögerung für Backend-Verarbeitung
    setTimeout(() => {
      // Alle Inhalte neu laden, um den aktuellen Serverstand zu erhalten
      loadContents();
    }, 1000);
  };

  // Handler zum Abbrechen der Content-Erstellung
  const handleCancelContentCreation = () => {
    setShowContentCreator(false);
  };

  // Resize-Funktionalität - verbesserte Version
  const handleMouseDown = (e) => {
    e.preventDefault(); // Verhindert Textauswahl während Drag
    setIsDragging(true);
    
    // Initialen Mausposition speichern
    const startX = e.clientX;
    const startWidth = width;
    
    const onMouseMove = (moveEvent) => {
      if (!isDragging) return;
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(250, Math.min(700, startWidth + delta));
      setWidth(newWidth);
      
      // CSS-Variable aktualisieren für sofortige visuelle Rückmeldung
      if (feedRef.current) {
        feedRef.current.style.width = `${newWidth}px`;
      }
    };
    
    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    // Event-Listener hinzufügen
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  // Event-Listener beim Unmount entfernen
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    // Für den Fall, dass mouseup außerhalb des Fensters ausgelöst wird
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* Plus-Button für neue Inhalte */}
      <button 
        className="create-content-fixed-button" 
        onClick={() => setShowContentCreator(true)}
        title="Neuen Inhalt erstellen"
      >
        +
      </button>
          
      {/* Statusmeldung immer sichtbar */}
      {message && (
        <div className="message-overlay">
          <span className={message.includes('erfolgreich') ? 'success' : 'error'}>
            {message}
          </span>
        </div>
      )}

      {/* Haupt-Bereich */}
      {showContentCreator ? (
        <ContentCreator 
          onSave={handleSaveContent} 
          onCancel={handleCancelContentCreation} 
        />
      ) : (
        <div 
          className="direct-feed-container"
          ref={feedRef}
          style={{ width: `${width}px` }}
        >
          {/* Resize-Handle */}
          <div 
            className="feed-resize-handle"
            ref={resizeHandleRef}
            onMouseDown={handleMouseDown}
          ></div>
          
          {loading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : contents.length > 0 ? (
            <Feed
              feedType="mine" 
              compact={true}
              customContents={contents.map((content, index) => {
                // Debug des Original-Contents
                debugContentObject(content, index);
                
                console.log('Verarbeite Content:', content);
                
                // WICHTIG: Ermittle die korrekte URL für Medieninhalte (Bilder etc.)
                let mediaUrl = null;
                
                // Verbesserte Typerkennung - mehrere Wege, einen Bildtyp zu erkennen
                const contentType = (content?.type || '').toLowerCase();
                const mimeType = (content?.mimeType || '').toLowerCase();
                const fileType = (content?.fileType || '').toLowerCase();
                
                // Erkennt Bildtypen durch mehrere Felder
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
                
                console.log(`Content #${index}: Typ-Erkennung:`, { 
                  contentType, mimeType, fileType, 
                  isImage, isVideo, isAudio 
                });
                
                // 1. Option: Explizite mediaUrl aus dem Content-Objekt
                if (typeof content?.mediaUrl === 'string' && content.mediaUrl.trim() !== '') {
                  mediaUrl = content.mediaUrl;
                  console.log(`Content #${index}: Verwende explizite mediaUrl: ${mediaUrl}`);
                }
                // 2. Option: Für Bildtypen - url-Feld könnte vorhanden sein
                else if (isImage && typeof content?.url === 'string' && content.url.trim() !== '') {
                  mediaUrl = content.url;
                  console.log(`Content #${index}: Verwende url-Feld als mediaUrl: ${mediaUrl}`);
                }
                // 3. Option: Spezifisches Feld 'path' könnte vorhanden sein
                else if (typeof content?.path === 'string' && content.path.trim() !== '') {
                  mediaUrl = content.path;
                  console.log(`Content #${index}: Verwende path-Feld als mediaUrl: ${mediaUrl}`);
                }
                // 4. Option: Für Bildtypen - content-Feld könnte eine URL sein
                else if (isImage && 
                    typeof content?.content === 'string' && 
                    (content.content.startsWith('http://') || 
                     content.content.startsWith('https://') || 
                     content.content.startsWith('/') ||
                     content.content.includes('minio') ||
                     content.content.includes('localhost'))) {
                  mediaUrl = content.content;
                  console.log(`Content #${index}: Verwende content als mediaUrl: ${mediaUrl}`);
                }
                
                // URL korrigieren falls relativ
                if (mediaUrl && mediaUrl.startsWith('/')) {
                  mediaUrl = `http://localhost:8000${mediaUrl}`;
                  console.log(`Content #${index}: Relative URL zu absoluter URL konvertiert: ${mediaUrl}`);
                }
                
                // URL konvertieren wenn es sich um eine MinIO-URL handelt
                if (typeof mediaUrl === 'string' && 
                    (mediaUrl.includes('localhost:9000') || mediaUrl.includes('minio'))) {
                  const originalUrl = mediaUrl;
                  mediaUrl = convertToAuthenticatedMediaUrl(mediaUrl, token);
                  console.log(`Content #${index}: URL konvertiert von ${originalUrl} zu ${mediaUrl} (Mit Token: ${!!token})`);
                }
                
                // Debug-Ausgabe für den erkannten mediaUrl vor ContentItem-Erstellung
                console.log(`Content #${index} finale mediaUrl:`, mediaUrl);
                
                // Erstelle ein ContentItem mit garantiertem Medien-URL
                const contentItem = {
                  // Konvertiere id zu number wenn es ein string ist, sonst generiere temporäre ID
                  id: content?.id ? (typeof content.id === 'string' ? parseInt(content.id, 10) || index + 1 : content.id) : index + 1,
                  title: content?.title || 'Ohne Titel',
                  // Für Text-Inhalte - verwende content als Text
                  content: (!isImage && !isVideo && !isAudio) ? 
                          (content?.content || 'Keine Beschreibung') : '',
                  // Wichtig: Für Medieninhalte - immer die URL explizit setzen
                  mediaUrl: mediaUrl || (isImage ? '/api/placeholder/400/225' : ''),
                  // Typ richtig setzen basierend auf der erweiterten Erkennung
                  type: isImage ? 'image-landscape' : 
                        isVideo ? 'video-landscape' : 
                        isAudio ? 'audio' : 'text',
                  // Fehlende erforderliche Eigenschaften für ContentItem hinzufügen
                  authorId: content?.authorId || 0,
                  ratings: content?.ratings || { beauty: 0, wisdom: 0, humor: 0 },
                  date: content?.createdAt || content?.date || new Date().toISOString(),
                  createdAt: content?.createdAt || content?.date || new Date().toISOString(),
                  updatedAt: content?.updatedAt || content?.date || new Date().toISOString(),
                  author: content?.author || { name: user?.username || 'Anonym' }
                };
                
                console.log(`Content #${index} finales ContentItem:`, contentItem);
                return contentItem;
              })}
              onSelectContent={() => {}} // Keine Aktion bei Auswahl
            />
          ) : (
            <div className="no-content">
              {/* Leer - keine Hinweistexte mehr angezeigt */}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MyContents;
