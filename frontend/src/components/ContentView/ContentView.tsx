import React from 'react';
import '../../styles/ContentPreview.css';
import RatingControls from './RatingControls';

interface ContentPreviewProps {
  content: any;
  onClose: () => void;
  onClick: () => void;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content, onClose, onClick }) => {
  // Rendert die Vorschau basierend auf dem Content-Typ
  const renderContentPreview = () => {
    switch (content.type) {
      case 'video':
        return (
          <div className="video-preview">
            <img src={content.url} alt={content.title} />
            <div className="play-button">▶</div>
          </div>
        );
      case 'image':
        return <img src={content.url} alt={content.title} className="image-preview" />;
      case 'text':
        return (
          <div className="text-preview">
            <p>{content.content.substring(0, 100)}...</p>
          </div>
        );
      case 'audio':
        return (
          <div className="audio-preview">
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
        return <div>Unknown content type</div>;
    }
  };

  return (
    <div className="content-preview" onClick={onClick}>
      <div className="preview-header">
        <h3>{content.title}</h3>
        <button className="close-button" onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>×</button>
      </div>
      
      <div className="preview-body">
        {renderContentPreview()}
        <div className="preview-info">
          <p className="content-author">{content.author}</p>
          <p className="content-description">{content.description}</p>
        </div>
      </div>
      
      <div className="preview-footer">
        <div className="preview-actions">
          <button className="comment-button">💬 Comments</button>
        </div>
        <RatingControls 
          contentId={content.id}
          ratings={content.ratings}
          isContent={true}
          mini={true}
        />
      </div>
    </div>
  );
};

export default ContentPreview;