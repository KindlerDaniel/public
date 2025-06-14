import React, { useState, useEffect, useContext } from 'react';
import './MyContents.css';
import ContentCreator from './ContentCreator';
import './ContentCreator.css';
import ContentCard from '../1SocietyLevel/shared/ContentCard.tsx';
import { AuthContext } from '../../context/AuthContext';

const MyContents = () => {
  const [message, setMessage] = useState('');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [contents, setContents] = useState([]);
  
  // Auth-Context für die Token-Verwaltung
  const { token, isAuthenticated } = useContext(AuthContext);


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
        setContents(data);
        if (data.length === 0) {
          setMessage('Keine Inhalte gefunden. Erstellen Sie Ihren ersten Inhalt!');
        } else {
          setMessage('');
        }
      } else if (data.contents && Array.isArray(data.contents)) {
        setContents(data.contents);
        if (data.contents.length === 0) {
          setMessage('Keine Inhalte gefunden. Erstellen Sie Ihren ersten Inhalt!');
        } else {
          setMessage('');
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
          {/* Content-Erstellung Button */}
          <div className="content-section-header">
            <h3>Inhalte erstellen</h3>
            <button 
              className="add-content-button" 
              onClick={() => setShowContentCreator(true)}
              title="Neuen Inhalt erstellen"
            >
              +
            </button>
          </div>
          
          {/* Erstellte Inhalte anzeigen - verbesserte Darstellung */}
          <div className="created-contents-section">
            <h3>Meine erstellten Inhalte {contents.length > 0 ? `(${contents.length})` : ""}</h3>
            
            {contents.length > 0 ? (
              <div className="contents-grid">
                {contents.map((content, index) => {
                  // Bereite das Content-Item für die ContentCard vor
                  const contentItem = {
                    ...content,
                    id: content?.id || `content-${index}`,
                    title: content?.title || 'Ohne Titel',
                    content: content?.content || 'Keine Beschreibung',
                    // Stelle sicher, dass wir den richtigen Typ verwenden
                    type: content?.type ? 
                      (content.type.startsWith('image/') ? 'image-landscape' : 
                       content.type.startsWith('video/') ? 'video-landscape' : 
                       content.type.startsWith('audio/') ? 'audio' : 'text') : 'text',
                    mediaUrl: content?.mediaUrl || null,
                    thumbnailUrl: content?.thumbnailUrl || null,
                    // Setze ein Standarddatum, falls keines vorhanden ist
                    date: content?.createdAt || new Date().toISOString(),
                    // Stelle sicher, dass wir einen Autor haben
                    author: content?.author || { name: 'Anonym' }
                  };
                  
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
