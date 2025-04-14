import React from 'react';
import { useAppContext } from '../../context/AppContext';
import '../../styles/RatingControls.css';

interface RatingControlsProps {
  contentId: string;
  ratings: {
    beauty: number;
    wisdom: number;
    humor: number;
  };
  isContent: boolean; // true für Content, false für Kommentar
  mini?: boolean; // Kompakte Ansicht für Vorschau
}

const RatingControls: React.FC<RatingControlsProps> = ({ 
  contentId, 
  ratings, 
  isContent,
  mini = false
}) => {
  const { rateContent, rateComment } = useAppContext();

  // Handler für das Rating
  const handleRate = (category: 'beauty' | 'wisdom' | 'humor', value: number) => {
    if (isContent) {
      rateContent(contentId, category, value);
    } else {
      rateComment(contentId, category, value);
    }
  };

  return (
    <div className={`rating-controls ${mini ? 'mini' : ''}`}>
      <div className="rating-item beauty">
        <span className="rating-label">Beauty</span>
        <div className="rating-value">
          <span className="rating-number">{ratings.beauty.toFixed(1)}</span>
          <button 
            className="rating-button" 
            onClick={() => handleRate('beauty', 1)}
          >
            ❤️
          </button>
        </div>
      </div>
      
      <div className="rating-item wisdom">
        <span className="rating-label">Wisdom</span>
        <div className="rating-value">
          <span className="rating-number">{ratings.wisdom.toFixed(1)}</span>
          <button 
            className="rating-button" 
            onClick={() => handleRate('wisdom', 1)}
          >
            🧠
          </button>
        </div>
      </div>
      
      <div className="rating-item humor">
        <span className="rating-label">Humor</span>
        <div className="rating-value">
          <span className="rating-number">{ratings.humor.toFixed(1)}</span>
          <button 
            className="rating-button" 
            onClick={() => handleRate('humor', 1)}
          >
            😄
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingControls;