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

  return (
    <button
      className={buttonClassName}
      style={{
        backgroundColor: isSelected ? getColor(probability) : 'white',
        color: 'black'
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {category}
    </button>
  );
};

export default CategoryButton;