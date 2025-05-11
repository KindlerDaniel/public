import React from 'react';
import './FeedTypeSelector.css';

export type FeedType = 'trending' | 'newest' | 'beauty' | 'wisdom' | 'humor';

interface FeedTypeSelectorProps {
  selectedType: FeedType;
  onTypeChange: (type: FeedType) => void;
}

const FeedTypeSelector: React.FC<FeedTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  const feedTypes: { value: FeedType; label: string }[] = [
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'Neueste' },
    { value: 'beauty', label: 'Schön' },
    { value: 'wisdom', label: 'Weise' },
    { value: 'humor', label: 'Lustig' }
  ];

  return (
    <div className="feed-type-selector">
      {feedTypes.map((type) => (
        <button
          key={type.value}
          className={`feed-type-button ${selectedType === type.value ? 'active' : ''}`}
          onClick={() => onTypeChange(type.value)}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};

export default FeedTypeSelector;