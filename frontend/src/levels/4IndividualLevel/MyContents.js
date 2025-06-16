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

// Hilfsfunktion: Konvertiert direkte MinIO URLs zu authentifizierten API-URLs mit Token-Parameter
const convertToAuthenticatedMediaUrl = (url, token) => {
  // Überprüfe ob url ein String ist
  if (!url || typeof url !== 'string') {
    console.log('URL ist kein String:', url);
    return url;
  }
  
  // MinIO URL-Muster: http://localhost:9000/bucketName/fileName
  try {
    if (url.includes('localhost:9000')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Pfadstruktur ist /bucketName/fileName
      if (pathParts.length >= 3) {
        const bucket = pathParts[1];
        const fileName = pathParts.slice(2).join('/');
        
        // Umwandeln in authentifizierte URL mit Token als Parameter
        if (token && typeof token === 'string') {
          return `http://localhost:8000/api/media/file/${bucket}/${fileName}?token=${token}`;
        } else {
          // Fallback ohne Token, wird aber einen 401 geben
          console.warn('Kein Token für MediaURL-Konvertierung verfügbar!');
          return `http://localhost:8000/api/media/file/${bucket}/${fileName}`;
        }
      }
    }
  } catch (error) {
    console.error('Fehler beim Konvertieren der Media-URL:', error);
  }
  
  return url;
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
    
    setMessage('Inhalte werden geladen...');
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
          setMessage('Keine Inhalte gefunden. Erstellen Sie Ihren ersten Inhalt!');
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
          setMessage('Keine Inhalte gefunden. Erstellen Sie Ihren ersten Inhalt!');
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
    
    // Kurze Erfolgsmeldung anzeigen
    setMessage('Inhalt erfolgreich erstellt! Lade aktuelle Daten...');
    
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

  // Resize-Funktionalität
  const handleMouseDown = (e) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newWidth = Math.max(250, Math.min(700, e.clientX - 50));
    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Event-Listener beim Unmount entfernen
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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
                
                // WICHTIG: Ermittle die korrekte URL für Medieninhalte (Bilder etc.)
                let mediaUrl = null;
                
                // Sicherstellen, dass wir auf Typen korrekt prüfen - defensiv programmieren
                const isImage = typeof content?.type === 'string' && content.type.includes('image');
                const isVideo = typeof content?.type === 'string' && content.type.includes('video');
                const isAudio = typeof content?.type === 'string' && content.type.includes('audio');
                
                // 1. Option: mediaUrl aus dem Content-Objekt
                if (typeof content?.mediaUrl === 'string' && content.mediaUrl.trim() !== '') {
                  mediaUrl = content.mediaUrl;
                  console.log(`Content #${index}: Verwende mediaUrl: ${mediaUrl}`);
                }
                // 2. Option: Für Bildtypen - content-Feld könnte eine URL sein
                else if (isImage && 
                    typeof content?.content === 'string' && 
                    (content.content.startsWith('http://') || content.content.startsWith('https://'))) {
                  mediaUrl = content.content;
                  console.log(`Content #${index}: Verwende content als mediaUrl: ${mediaUrl}`);
                }
                
                // URL konvertieren wenn es sich um eine MinIO-URL handelt
                if (typeof mediaUrl === 'string' && mediaUrl.includes('localhost:9000')) {
                  const originalUrl = mediaUrl;
                  mediaUrl = convertToAuthenticatedMediaUrl(mediaUrl, token);
                  console.log(`Content #${index}: URL konvertiert von ${originalUrl} zu ${mediaUrl} (Mit Token: ${!!token})`);
                }
                
                // Erstelle ein ContentItem mit garantiertem Medien-URL
                return {
                  // Konvertiere id zu number wenn es ein string ist, sonst generiere temporäre ID
                  id: content?.id ? (typeof content.id === 'string' ? parseInt(content.id, 10) || index + 1 : content.id) : index + 1,
                  title: content?.title || 'Ohne Titel',
                  // Für Text-Inhalte - verwende content als Text
                  content: (!isImage && !isVideo && !isAudio) ? 
                          (content?.content || 'Keine Beschreibung') : '',
                  // Für Medieninhalte - setze entweder eine URL oder einen Platzhalter
                  mediaUrl: mediaUrl || '/api/placeholder/400/225',
                  type: isImage ? 'image-landscape' : 
                        isVideo ? 'video-landscape' : 
                        isAudio ? 'audio' : 'text',
                  // Fehlende erforderliche Eigenschaften für ContentItem hinzufügen
                  authorId: content?.authorId || 0,
                  ratings: content?.ratings || { beauty: 0, wisdom: 0, humor: 0 },
                  date: content?.createdAt || content?.date || new Date().toISOString(),
                  createdAt: content?.createdAt || content?.date || new Date().toISOString(),
                  updatedAt: content?.updatedAt || content?.date || new Date().toISOString(),
                  author: content?.author || { name: 'Anonym' }
                };
              })}
              onSelectContent={() => {}} // Keine Aktion bei Auswahl
            />
          ) : (
            <div className="no-content">
              <p>Noch keine Inhalte erstellt.</p>
              <p>Klicke auf das + Symbol, um einen neuen Inhalt zu erstellen.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MyContents;
