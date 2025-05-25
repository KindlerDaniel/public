import React, { useState, useEffect, useRef } from 'react';
import { CategoryProbabilities, CategoryKey } from './types.ts';
import FilterSummary from './FilterSummary.tsx';
import FilterButtonsPanel from './FilterButtonsPanel.tsx';
import { useFilterLogic } from './useFilterLogic.ts';
import './FilterControls.css';

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
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    incrementProbability, 
    handleClick, 
    getProbabilityColor 
  } = useFilterLogic(probabilities, setProbabilities);

  // When probabilities change, inform the parent component
  useEffect(() => {
    onProbabilityChange(probabilities);
  }, [probabilities, onProbabilityChange]);

  // Function to set a single category to 100% and all others to 0%
  const setCategoryTo100Percent = (button: CategoryKey) => {
    const newProbabilities = { ...initialProbabilities };
    Object.keys(newProbabilities).forEach(key => {
      newProbabilities[key as CategoryKey] = key === button ? 100 : 0;
    });
    setProbabilities(newProbabilities);
  };

  // Listen for the custom double-click event
  useEffect(() => {
    const handleCategoryDoubleClick = (event: any) => {
      const { category } = event.detail;
      setCategoryTo100Percent(category);
    };

    document.addEventListener('categoryDoubleClick', handleCategoryDoubleClick);
    return () => document.removeEventListener('categoryDoubleClick', handleCategoryDoubleClick);
  });

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
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
          setCategoryTo100Percent={setCategoryTo100Percent}
          onMouseLeave={handleMouseLeave}
        />
      )}
    </div>
  );
};

export default FilterControls;