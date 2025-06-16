import React, { useState, useEffect, useContext } from 'react';
import './MyContents.css';
import ContentCreator from './ContentCreator';
import './ContentCreator.css';
import ContentCard from '../1SocietyLevel/shared/ContentCard.tsx';
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
  const [message, setMessage] = useState('');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [contents, setContents] = useState([]);
  
  // Auth-Context für die Token-Verwaltung und Benutzerdaten
  const { token, isAuthenticated, user } = useContext(AuthContext);


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
        setMessage('Keine Inhalte verfügbar - unerwartetes Datenformat');
      }
    } catch (error) {
      console.error('Load contents error:', error);
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

  return (
    <div className="tab-panel mycontents-panel">
      {showContentCreator ? (
        <ContentCreator 
          onSave={handleSaveContent} 
          onCancel={handleCancelContentCreation} 
        />
      ) : (
        <div className="content-container">
          <div className="content-header">
            <h2>Meine Inhalte</h2>
            {user && (
              <div className="user-info">
                <p>Angemeldet als: <strong>{user.name || user.username || user.email}</strong></p>
                <p className="info-text">Es werden nur Ihre eigenen Inhalte angezeigt.</p>
              </div>
            )}
            <button 
              className="create-content-button" 
              onClick={() => setShowContentCreator(true)}
            >
              + Neuer Inhalt
            </button>
          </div>
          {/* Erstellte Inhalte anzeigen - verbesserte Darstellung */}
          <div className="created-contents-section">
            <h3>Meine erstellten Inhalte {contents.length > 0 ? `(${contents.length})` : ""}</h3>
            
            {contents.length > 0 ? (
              <div className="contents-grid">
                {contents.map((content, index) => {
                  // Bereite das Content-Item für die ContentCard vor
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
                  const contentItem = {
                    id: content?.id || `content-${index}`,
                    title: content?.title || 'Ohne Titel',
                    // Für Text-Inhalte - verwende content als Text
                    content: (!isImage && !isVideo && !isAudio) ? 
                             (content?.content || 'Keine Beschreibung') : '',
                    // Für Medieninhalte - setze entweder eine URL oder einen Platzhalter
                    mediaUrl: mediaUrl || '/api/placeholder/400/225',
                    type: isImage ? 'image-landscape' : 
                          isVideo ? 'video-landscape' : 
                          isAudio ? 'audio' : 'text',
                    date: content?.createdAt || content?.date || new Date().toISOString(),
                    author: content?.author || { name: 'Anonym' }
                  };
                  
                  // Debug-Ausgabe für Content-Item
                  console.log(`Content #${index} - Type: ${contentItem.type}, Media-URL: ${contentItem.mediaUrl}`);
                  
                  return (
                    <div key={contentItem.id} className="content-card-wrapper">
                      <ContentCard 
                        content={contentItem}
                        compact={false}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="info-message">{message || 'Keine Inhalte vorhanden. Erstellen Sie Ihren ersten Inhalt!'}</p>
            )}
          </div>
          
          {/* Statusmeldung */}
          {message && (
            <div className={`message ${message.includes('erfolgreich') ? 'success' : 'error'}`} style={{marginTop: '20px'}}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyContents;
