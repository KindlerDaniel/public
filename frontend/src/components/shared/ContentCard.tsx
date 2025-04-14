import React from 'react';
import '../../styles/ContentCard.css';
import RatingControls from './RatingControls';

interface ContentCardProps {
  content: {
    id: string;
    type: string;
    title: string;
    content: string;
    author: any;
    date: string;
    ratings: {
      beauty: number;
      wisdom: number;
      humor: number;
    };
    userRating?: {
      beauty?: boolean;
      wisdom?: boolean;
      humor?: boolean;
    };
    thumbnail?: string;
    mediaUrl?: string;
  };
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

  // Rendert den Medieninhalt basierend auf dem Content-Typ
  const renderMedia = () => {
    switch (content.type) {
      case 'video':
        return (
          <div className="content-card-media video">
            <img 
              src={content.thumbnail || "/api/placeholder/320/180"} 
              alt={content.title}
            />
            <div className="play-button">▶</div>
          </div>
        );
      case 'image':
        return (
          <div className="content-card-media image">
            <img 
              src={content.content || "/api/placeholder/320/180"} 
              alt={content.title}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="content-card-media audio">
            <div className="audio-icon">🔊</div>
            <div className="audio-waveform">
              {Array(10).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="waveform-bar" 
                  style={{ height: `${Math.random() * 20 + 5}px` }}
                ></div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`content-card ${selected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
      onClick={onClick}
    >
      {content.type !== 'text' && renderMedia()}
      
      <div className="content-card-details">
        <div className="content-card-header">
          <h3 className="content-card-title">{content.title}</h3>
        </div>
        
        <div className="content-card-meta">
          <span className="content-card-author">{content.author.name}</span>
          <span className="content-card-date">{formatDate(content.date)}</span>
        </div>
        
        {content.type === 'text' && (
          <div className="content-card-content">
            {typeof content.content === 'string' ? 
              content.content.substring(0, 150) + (content.content.length > 150 ? '...' : '') : 
              'Kein Inhalt verfügbar'}
          </div>
        )}
        
        <div className="content-card-footer">
          <div className="content-card-ratings">
            <div className="content-card-rating content-card-beauty">
              <span className="content-card-rating-icon">❤️</span>
              <span>{content.ratings.beauty}</span>
            </div>
            <div className="content-card-rating content-card-wisdom">
              <span className="content-card-rating-icon">🧠</span>
              <span>{content.ratings.wisdom}</span>
            </div>
            <div className="content-card-rating content-card-humor">
              <span className="content-card-rating-icon">😄</span>
              <span>{content.ratings.humor}</span>
            </div>
          </div>
          
          <div className="content-card-actions">
            <button className="content-card-action-button">
              💬 Kommentare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;