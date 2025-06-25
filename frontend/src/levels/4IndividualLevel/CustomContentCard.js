import React from 'react';
import '../1SocietyLevel/shared/ContentCard.css';

const CustomContentCard = ({ 
  content, 
  selected = false, 
  compact = false,
  onClick
}) => {
  // Formatiere das Datum
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Formatiere Dauer (für Video/Audio)
  const formatDuration = (duration) => {
    if (!duration) return '';
    return duration;
  };

  // Rendert Video Querformat - nur wenn mediaUrl vorhanden ist
  const renderVideoLandscape = () => {
    if (!content.mediaUrl) return null;
    
    return (
      <div className="content-layout video-landscape">
        <div className="media-container landscape">
          <video 
            className="media-element"
            poster={content.thumbnailUrl} // Kein Fallback
            controls
          >
            <source src={content.mediaUrl} type="video/mp4" />
          </video>
          <div className="play-overlay">▶</div>
          {content.duration && (
            <div className="duration-badge">{formatDuration(content.duration)}</div>
          )}
        </div>
        <div className="content-text">
          {content.title && <h3 className="content-title">{content.title}</h3>}
          {content.content && <p className="content-description">{content.content}</p>}
        </div>
      </div>
    );
  };

  // Rendert Video Hochformat - nur wenn mediaUrl vorhanden ist
  const renderVideoPortrait = () => {
    if (!content.mediaUrl) return null;
    
    return (
      <div className="content-layout video-portrait">
        <div className="media-container portrait">
          <video 
            className="media-element"
            poster={content.thumbnailUrl} // Kein Fallback
            controls
          >
            <source src={content.mediaUrl} type="video/mp4" />
          </video>
          <div className="play-overlay">▶</div>
          {content.duration && (
            <div className="duration-badge">{formatDuration(content.duration)}</div>
          )}
        </div>
        <div className="content-text">
          {content.title && <h3 className="content-title">{content.title}</h3>}
          {content.content && <p className="content-description">{content.content}</p>}
        </div>
      </div>
    );
  };

  // Rendert Bild Querformat - nur wenn mediaUrl vorhanden ist
  const renderImageLandscape = () => {
    if (!content.mediaUrl) return null;
    
    return (
      <div className="content-layout image-landscape">
        <div className="media-container landscape">
          <img 
            className="media-element"
            src={content.mediaUrl} // Kein Fallback
            alt={content.title || ""}
          />
        </div>
        <div className="content-text">
          {content.title && <h3 className="content-title">{content.title}</h3>}
          {content.content && <p className="content-description">{content.content}</p>}
        </div>
      </div>
    );
  };

  // Rendert Bild Hochformat - nur wenn mediaUrl vorhanden ist
  const renderImagePortrait = () => {
    if (!content.mediaUrl) return null;
    
    return (
      <div className="content-layout image-portrait">
        <div className="media-container portrait">
          <img 
            className="media-element"
            src={content.mediaUrl} // Kein Fallback
            alt={content.title || ""}
          />
        </div>
        <div className="content-text">
          {content.title && <h3 className="content-title">{content.title}</h3>}
          {content.content && <p className="content-description">{content.content}</p>}
        </div>
      </div>
    );
  };

  // Rendert Text - nur wenn Titel oder Inhalt vorhanden ist
  const renderText = () => {
    if (!content.title && !content.content) return null;
    
    return (
      <div className="content-layout text-only">
        <div className="content-text">
          {content.title && <h3 className="content-title">{content.title}</h3>}
          {content.content && <p className="content-description">{content.content}</p>}
        </div>
      </div>
    );
  };

  // Rendert Audio - nur wenn mediaUrl vorhanden ist
  const renderAudio = () => {
    if (!content.audioUrl && !content.mediaUrl) return null;
    
    return (
      <div className="content-layout audio">
        <div className="content-text">
          {content.title && <h3 className="content-title">{content.title}</h3>}
          <div className="audio-container">
            <audio 
              className="audio-player"
              controls
              src={content.audioUrl || content.mediaUrl}
            >
              Ihr Browser unterstützt das Audio-Element nicht.
            </audio>
            {content.duration && (
              <span className="audio-duration">{formatDuration(content.duration)}</span>
            )}
          </div>
          {content.content && <p className="content-description">{content.content}</p>}
        </div>
      </div>
    );
  };

  // Hauptrender-Funktion basierend auf Content-Typ
  const renderContent = () => {
    switch (content.type) {
      case 'video-landscape':
        return renderVideoLandscape();
      case 'video-portrait':
        return renderVideoPortrait();
      case 'image-landscape':
        return renderImageLandscape();
      case 'image-portrait':
        return renderImagePortrait();
      case 'text':
        return renderText();
      case 'audio':
        return renderAudio();
      case 'video':
        return renderVideoLandscape(); // Default zu landscape
      case 'image':
        return renderImageLandscape(); // Default zu landscape
      default:
        return renderText();
    }
  };

  // Wenn es keinen renderbaren Inhalt gibt, nichts anzeigen
  const contentToRender = renderContent();
  if (!contentToRender) return null;

  return (
    <div 
      className={`content-card ${content.type} ${selected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
      onClick={onClick}
    >
      <div className="content-card-body">
        {contentToRender}
      </div>
      
      <div className="content-card-meta">
        <div className="meta-info">
          <span className="author">{content.author?.name || ""}</span>
          {content.date && <span className="date">{formatDate(content.date)}</span>}
        </div>
      </div>
    </div>
  );
};

export default CustomContentCard;
