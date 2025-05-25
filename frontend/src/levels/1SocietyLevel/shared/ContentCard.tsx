import React from 'react';
import { ContentItem } from '../../../types.ts';
import './ContentCard.css';

interface ContentCardProps {
  content: ContentItem;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  selected = false, 
  compact = false,
  onClick
}) => {
  // Formatiere das Datum
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Formatiere Dauer (für Video/Audio)
  const formatDuration = (duration?: string) => {
    if (!duration) return '';
    return duration;
  };

  // Rendert Video Querformat
  const renderVideoLandscape = () => (
    <div className="content-layout video-landscape">
      <div className="media-container landscape">
        <video 
          className="media-element"
          poster={content.thumbnailUrl || "/api/placeholder/400/225"}
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
        <h3 className="content-title">{content.title}</h3>
        <p className="content-description">{content.content}</p>
      </div>
    </div>
  );

  // Rendert Video Hochformat
  const renderVideoPortrait = () => (
    <div className="content-layout video-portrait">
      <div className="media-container portrait">
        <video 
          className="media-element"
          poster={content.thumbnailUrl || "/api/placeholder/225/400"}
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
        <h3 className="content-title">{content.title}</h3>
        <p className="content-description">{content.content}</p>
      </div>
    </div>
  );

  // Rendert Bild Querformat
  const renderImageLandscape = () => (
    <div className="content-layout image-landscape">
      <div className="media-container landscape">
        <img 
          className="media-element"
          src={content.mediaUrl || content.content || "/api/placeholder/400/225"}
          alt={content.title}
        />
      </div>
      <div className="content-text">
        <h3 className="content-title">{content.title}</h3>
        <p className="content-description">{content.content}</p>
      </div>
    </div>
  );

  // Rendert Bild Hochformat
  const renderImagePortrait = () => (
    <div className="content-layout image-portrait">
      <div className="media-container portrait">
        <img 
          className="media-element"
          src={content.mediaUrl || content.content || "/api/placeholder/225/400"}
          alt={content.title}
        />
      </div>
      <div className="content-text">
        <h3 className="content-title">{content.title}</h3>
        <p className="content-description">{content.content}</p>
      </div>
    </div>
  );

  // Rendert Text
  const renderText = () => (
    <div className="content-layout text-only">
      <div className="content-text">
        <h3 className="content-title">{content.title}</h3>
        <p className="content-description">{content.content}</p>
      </div>
    </div>
  );

  // Rendert Audio
  const renderAudio = () => (
    <div className="content-layout audio">
      <div className="content-text">
        <h3 className="content-title">{content.title}</h3>
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
        <p className="content-description">{content.content}</p>
      </div>
    </div>
  );

  // Rendert Diskussion - Frage ist direkt der Titel
  const renderDiscussion = () => (
    <div className="content-layout discussion">
      <div className="content-text">
        <h3 className="content-title">{content.question || content.title}</h3>
        {content.discussion && (
          <div className="discussion-exchanges">
            {content.discussion.exchanges.slice(0, 2).map((exchange, index) => (
              <div key={index} className={`discussion-exchange ${exchange.speaker.toLowerCase()}`}>
                <span className="exchange-text">{exchange.text}</span>
              </div>
            ))}
            {content.discussion.exchanges.length > 2 && (
              <div className="discussion-more">
                +{content.discussion.exchanges.length - 2} weitere Beiträge...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

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
      case 'discussion':
        return renderDiscussion();
      // Fallback für alte Typen
      case 'article':
        return renderText();
      case 'video':
        return renderVideoLandscape(); // Default zu landscape
      case 'image':
        return renderImageLandscape(); // Default zu landscape
      default:
        return renderText();
    }
  };

  return (
    <div 
      className={`content-card ${content.type} ${selected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
      onClick={onClick}
    >
      <div className="content-card-body">
        {renderContent()}
      </div>
      
      <div className="content-card-meta">
        <div className="meta-info">
          <span className="author">{content.author.name}</span>
          <span className="date">{formatDate(content.date)}</span>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;