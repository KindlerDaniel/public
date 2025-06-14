import React, { useState, useEffect } from 'react';
import './MyContents.css';
import ContentCreator from './ContentCreator';
import './ContentCreator.css';
import ContentCard from '../1SocietyLevel/shared/ContentCard.tsx';

const MyContents = () => {
  const [message, setMessage] = useState('');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [contents, setContents] = useState([]);


  // Content-Items laden
  const loadContents = async () => {
    try {
      setMessage('Inhalte werden geladen...');
      
      const response = await fetch('http://localhost:8000/api/media/content');
      
      if (!response.ok) {
        throw new Error(`Fehler beim Laden der Inhalte: ${response.status}`);
      }
      
      const contentData = await response.json();
      console.log('Geladene Inhalte:', contentData);
      
      if (Array.isArray(contentData.contents)) {
        setContents(contentData.contents);
        setMessage(contentData.contents.length > 0 ? '' : 'Keine Inhalte gefunden');
      } else if (Array.isArray(contentData)) {
        setContents(contentData);
        setMessage(contentData.length > 0 ? '' : 'Keine Inhalte gefunden');
      } else {
        console.error('Unerwartetes Datenformat:', contentData);
        setContents([]);
        setMessage('Keine Inhalte verfügbar - unerwartetes Datenformat');
      }
    } catch (error) {
      console.error('Load contents error:', error);
      setMessage(`Fehler beim Laden der Inhalte: ${error.message}`);
      setContents([]);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  // Handler für das Speichern von neuen Content-Items
  const handleSaveContent = (newContent) => {
    setContents([newContent, ...contents]);
    setShowContentCreator(false);
    setMessage('Inhalt erfolgreich erstellt!');
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
