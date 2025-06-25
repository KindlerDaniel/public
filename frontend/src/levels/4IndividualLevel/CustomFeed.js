import React from 'react';
import CustomContentCard from './CustomContentCard';
import '../1SocietyLevel/ContentView/Feed.css';

const CustomFeed = ({ 
  compact = false, 
  onSelectContent,
  customContents,
}) => {
  if (!customContents || customContents.length === 0) {
    return null; // Keine Anzeige wenn keine Inhalte
  }

  return (
    <div className={`feed-container ${compact ? 'compact' : ''}`}>
      <div className="feed-list">
        {customContents.map((item) => (
          <CustomContentCard 
            key={item.id}
            content={item}
            compact={compact}
            onClick={() => onSelectContent && onSelectContent(item.id.toString())}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomFeed;
