import React from 'react';
import '../../styles/RatingControls.css';

interface RatingControlsProps {
  contentId?: string; // contentId optional gemacht
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
  onRate?: (type: 'beauty' | 'wisdom' | 'humor', value: boolean) => void;
  isContent?: boolean;
  mini?: boolean;
  small?: boolean;
}

const RatingControls: React.FC<RatingControlsProps> = ({ 
  contentId, 
  ratings, 
  userRating = {},
  onRate,
  isContent = true,
  mini = false,
  small = false
}) => {
  // Handler für das Rating
  const handleRate = (category: 'beauty' | 'wisdom' | 'humor', value: boolean) => {
    if (onRate) {
      onRate(category, value);
    }
  };

  return (
    <div className={`rating-controls ${mini ? 'mini' : ''} ${small ? 'small' : ''}`}>
      <div className={`rating-item beauty ${userRating.beauty ? 'active' : ''}`}>
        <span className="rating-label">Beauty</span>
        <div className="rating-value">
          <span className="rating-number">{ratings.beauty}</span>
          <button 
            className="rating-button" 
            onClick={() => handleRate('beauty', !userRating.beauty)}
          >
            ❤️
          </button>
        </div>
      </div>
      
      <div className={`rating-item wisdom ${userRating.wisdom ? 'active' : ''}`}>
        <span className="rating-label">Wisdom</span>
        <div className="rating-value">
          <span className="rating-number">{ratings.wisdom}</span>
          <button 
            className="rating-button" 
            onClick={() => handleRate('wisdom', !userRating.wisdom)}
          >
            🧠
          </button>
        </div>
      </div>
      
      <div className={`rating-item humor ${userRating.humor ? 'active' : ''}`}>
        <span className="rating-label">Humor</span>
        <div className="rating-value">
          <span className="rating-number">{ratings.humor}</span>
          <button 
            className="rating-button" 
            onClick={() => handleRate('humor', !userRating.humor)}
          >
            😄
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingControls;