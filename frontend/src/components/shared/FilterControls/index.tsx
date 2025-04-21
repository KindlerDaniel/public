// Main container component that orchestrates everything

import React, { useState, useEffect } from 'react';
import { CategoryProbabilities } from './types.ts';
import FilterSummary from './FilterSummary.tsx';
import FilterButtonsPanel from './FilterButtonsPanel.tsx';
import { useFilterLogic } from './hooks/useFilterLogic.ts';
import '../../../styles/filter-controls.css';

interface FilterControlsProps {
  onProbabilityChange: (probabilities: CategoryProbabilities) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onProbabilityChange }) => {
  // Initial state: Wise 100%, all others 0%
  const initialProbabilities: CategoryProbabilities = {
    wise: 100,
    stupid: 0,
    beautiful: 0,
    repulsive: 0,
    funny: 0,
    unfunny: 0
  };

  const [probabilities, setProbabilities] = useState<CategoryProbabilities>(initialProbabilities);
  const [isHovered, setIsHovered] = useState(false);
  
  const { 
    incrementProbability, 
    handleClick, 
    getProbabilityColor 
  } = useFilterLogic(probabilities, setProbabilities);

  // When probabilities change, inform the parent component
  useEffect(() => {
    onProbabilityChange(probabilities);
  }, [probabilities, onProbabilityChange]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="category-filter-container">
      {!isHovered ? (
        <FilterSummary 
          probabilities={probabilities} 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave} 
        />
      ) : (
        <FilterButtonsPanel 
          probabilities={probabilities}
          getProbabilityColor={getProbabilityColor}
          incrementProbability={incrementProbability}
          handleClick={handleClick}
          onMouseLeave={handleMouseLeave}
        />
      )}
    </div>
  );
};

export default FilterControls;