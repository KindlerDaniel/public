import React from 'react';
import './FeedTypeSelector.css';

export type FeedType = 'search' | 'mine' | 'auto' | 'pos' | 'history';

interface FeedTypeSelectorProps {
  selectedType: FeedType;
  onTypeChange: (type: FeedType) => void;
}

const FeedTypeSelector: React.FC<FeedTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  const feedTypes: { value: FeedType; label: string }[] = [
    { value: 'search', label: 'Search' },
    { value: 'mine', label: 'Mine' },
    { value: 'auto', label: 'Auto' },
    { value: 'pos', label: 'Pos' },
    { value: 'history', label: 'History' }
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