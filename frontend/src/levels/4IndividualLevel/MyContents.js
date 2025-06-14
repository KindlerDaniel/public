import React, { useState, useEffect } from 'react';
import './MyContents.css';
import ContentCreator from './ContentCreator';
import './ContentCreator.css';

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
                {contents.map((content, index) => (
                  <div key={content?.id || index} className="content-item" style={{margin: '15px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#333'}}>{content?.title || 'Ohne Titel'}</h4>
                    
                    {/* Prominente Darstellung von Medien, falls vorhanden */}
                    {content?.mediaUrl && (
                      <div style={{marginBottom: '12px'}}>
                        {content.type && content.type.startsWith('image/') ? (
                          <img 
                            src={content.mediaUrl} 
                            alt={content.title || 'Bild'} 
                            style={{
                              width: '100%',
                              maxHeight: '250px',
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }} 
                          />
                        ) : content.type && content.type.startsWith('video/') ? (
                          <video 
                            src={content.mediaUrl} 
                            controls 
                            style={{width: '100%', borderRadius: '6px'}} 
                          />
                        ) : (
                          <div style={{padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px'}}>
                            <p>Medientyp: {content.type || 'Unbekannt'}</p>
                            <a href={content.mediaUrl} target="_blank" rel="noopener noreferrer">
                              Medien öffnen
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p style={{margin: '0', color: '#555'}}>{content?.content || 'Keine Beschreibung'}</p>
                    
                    {/* Zusätzliche Metadaten */}
                    <div style={{marginTop: '15px', fontSize: '0.85rem', color: '#777'}}>
                      Erstellt: {new Date(content?.createdAt || Date.now()).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))}
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
