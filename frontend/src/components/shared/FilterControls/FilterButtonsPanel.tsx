// Panel of filter buttons that appears on hover

import React from 'react';
import { CategoryProbabilities, CategoryKey } from './types.ts';
import CategoryButtonGroup from './CategoryButtonGroup.tsx';

interface FilterButtonsPanelProps {
  probabilities: CategoryProbabilities;
  getProbabilityColor: (probability: number) => string;
  incrementProbability: (button: CategoryKey) => void;
  handleClick: (button: CategoryKey) => void;
  onMouseLeave: () => void;
}

const FilterButtonsPanel: React.FC<FilterButtonsPanelProps> = ({
  probabilities,
  getProbabilityColor,
  incrementProbability,
  handleClick,
  onMouseLeave
}) => {
  // Define the category pairs
  const categoryPairs = [
    { positive: 'wise' as CategoryKey, negative: 'stupid' as CategoryKey },
    { positive: 'beautiful' as CategoryKey, negative: 'repulsive' as CategoryKey },
    { positive: 'funny' as CategoryKey, negative: 'unfunny' as CategoryKey }
  ];

  return (
    <div className="category-filter-buttons" onMouseLeave={onMouseLeave}>
      {categoryPairs.map((pair, index) => (
        <CategoryButtonGroup
          key={index}
          positiveCategory={pair.positive}
          negativeCategory={pair.negative}
          probabilities={probabilities}
          getProbabilityColor={getProbabilityColor}
          incrementProbability={incrementProbability}
          handleClick={handleClick}
        />
      ))}
    </div>
  );
};

export default FilterButtonsPanel;
