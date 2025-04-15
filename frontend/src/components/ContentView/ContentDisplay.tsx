import React, { useState, useEffect } from 'react';
import { ContentItem } from '../../types';
import '../../styles/ContentDisplay.css';
import { getContentById, updateContentRating } from '../../utils/mockData';
import RatingControls from '../shared/RatingControls';

interface ContentDisplayProps {
  contentId?: string;
  content?: ContentItem; // Hinzugefügt, damit Inhalte auch direkt übergeben werden können
  compact?: boolean;
  onViewComments?: () => void;
  onSwitchToBubbleView?: () => void;
  onSwitchToCommentView?: () => void;
}


const ContentDisplay: React.FC<ContentDisplayProps> = ({ 
  contentId, 
  content: initialContent, // Erlaubt Übergabe von Inhalten direkt
  compact = false,
  onViewComments,
  onSwitchToBubbleView,
  onSwitchToCommentView
}) => {
  const [content, setContent] = useState<ContentItem | null>(initialContent || null);
  const [loading, setLoading] = useState<boolean>(!initialContent);
  const [error, setError] = useState<string | null>(null);

  // Lade Inhalt basierend auf contentId
  useEffect(() => {
    if (initialContent) {
      // Wenn Inhalt direkt übergeben wurde, nicht laden
      setContent(initialContent);
      setLoading(false);
      return;
    }
    
    if (!contentId) {
      setContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // In einer echten Implementierung würde hier ein API-Aufruf stehen
      const contentData = getContentById(contentId);
      if (contentData) {
        setContent(contentData);
        setError(null);
      } else {
        setError('Der angeforderte Inhalt konnte nicht gefunden werden.');
      }
    } catch (err) {
      console.error('Fehler beim Laden des Inhalts:', err);
      setError('Der Inhalt konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [contentId, initialContent]);

  // Handler für das Bewerten von Inhalten
  const handleRate = (type: 'beauty' | 'wisdom' | 'humor', value: boolean) => {
    if (!content) return;
    
    // In einer echten Implementierung würde hier ein API-Aufruf stehen
    const updatedContent = updateContentRating(content.id, type, value);
    if (updatedContent) {
      setContent({
        ...content,
        ratings: updatedContent.ratings,
        userRating: {
          ...content.userRating,
          [type]: value
        }
      });
    }
  };

  // Formatiert das Datum
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Rendert Medieninhalte basierend auf dem Content-Typ
  const renderMedia = () => {
    if (!content) return null;

    switch (content.type) {
      case 'video':
        return (
          <div className="content-media-container">
            <video 
              className="content-media"
              controls
              poster={content.thumbnailUrl}
            >
              <source src={content.mediaUrl || ''} type="video/mp4" />
              Dein Browser unterstützt das Video-Tag nicht.
            </video>
          </div>
        );
      case 'image':
        return (
          <div className="content-media-container">
            <img 
              className="content-media"
              src={typeof content.content === 'string' ? content.content : '/api/placeholder/800/450'} 
              alt={content.title}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="content-media-container audio">
            <audio 
              className="content-audio"
              controls
            >
              <source src={content.mediaUrl || ''} type="audio/mpeg" />
              Dein Browser unterstützt das Audio-Tag nicht.
            </audio>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="content-loading">Inhalt wird geladen...</div>;
  }

  if (error) {
    return <div className="content-error">{error}</div>;
  }

  if (!content) {
    return (
      <div className="content-empty">
        <h2>Kein Inhalt ausgewählt</h2>
        <p>Wähle einen Inhalt aus dem Feed aus oder kehre zur Kugel-Ansicht zurück.</p>
        
        {onSwitchToBubbleView && (
          <button 
            className="switch-view-button"
            onClick={onSwitchToBubbleView}
          >
            Zur Kugel-Ansicht
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`content-display ${compact ? 'compact' : ''}`}>
      <div className="content-display-header">
        <div className="content-header-info">
          <h1 className="content-title">{content.title}</h1>
          <div className="content-author">
            von {content.author.name} • {formatDate(content.date)}
          </div>
        </div>
        
        <div className="content-action-buttons">
          {onViewComments && (
            <button 
              className="view-comments-button"
              onClick={onViewComments}
            >
              Kommentare
            </button>
          )}
          
          {onSwitchToCommentView && (
            <button 
              className="switch-comments-view-button"
              onClick={onSwitchToCommentView}
            >
              Zur Kommentar-Ansicht
            </button>
          )}
          
          {onSwitchToBubbleView && (
            <button 
              className="switch-bubble-view-button"
              onClick={onSwitchToBubbleView}
            >
              Zur Kugel-Ansicht
            </button>
          )}
        </div>
      </div>
      
      <div className="content-body">
        {/* Medien-Inhalte (Bild, Video, Audio) */}
        {renderMedia()}
        
        {/* Textinhalt */}
        {content.type === 'text' && (
          <div className="content-text">
            {typeof content.content === 'string' ? content.content : 'Kein Inhalt verfügbar'}
          </div>
        )}
        
        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="content-tags">
            {content.tags.map(tag => (
              <span key={tag} className="content-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="content-footer">
        <div className="content-ratings">
          <RatingControls 
            contentId={content.id}
            ratings={content.ratings}
            userRating={content.userRating}
            onRate={handleRate}
          />
        </div>
        
        {onViewComments && (
          <button 
            className="new-comment-button"
            onClick={onViewComments}
          >
            Kommentar schreiben
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentDisplay;