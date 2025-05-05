import React from 'react';
import './FeedArea.css';

interface FeedAreaProps {
  isVisible: boolean;
}

const FeedArea: React.FC<FeedAreaProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="feed-area">
      <div className="feed-area-content">
        {/* Hier werden später die Feed-Inhalte angezeigt */}
        <p className="feed-placeholder">Feed-Inhalte werden hier angezeigt</p>
      </div>
      <div className="feed-area-footer">
        <p>Feed-Steuerelemente</p>
      </div>
    </div>
  );
};

export default FeedArea;
