// Individual category button component

import React from 'react';
import { CategoryKey } from './types.ts';

interface CategoryButtonProps {
  category: CategoryKey;
  isPositive: boolean;
  isSelected: boolean;
  probability: number;
  getColor: (probability: number) => string;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isPositive,
  isSelected,
  probability,
  getColor,
  onMouseDown,
  onMouseUp
}) => {
  const buttonClassName = `category-button ${isPositive ? 'positive' : 'negative'} ${
    isPositive ? 'wisdom' : 'wisdom'
  } ${isSelected ? 'selected' : ''}`;

  // Handle double click to set this button to 100%
  const handleDoubleClick = () => {
    // Emit custom event that FilterControls can listen for
    const event = new CustomEvent('categoryDoubleClick', { 
      detail: { category },
      bubbles: true // This ensures the event bubbles up the DOM tree
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      className={buttonClassName}
      style={{
        backgroundColor: isSelected ? getColor(probability) : 'white',
        color: 'black'
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onDoubleClick={handleDoubleClick} // Add native double-click handler
    >
      {category}
    </button>
  );
};

export default CategoryButton;