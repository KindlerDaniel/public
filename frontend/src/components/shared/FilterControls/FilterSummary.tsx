// Summary button component that shows active filters

import React from 'react';
import { CategoryProbabilities } from './types.ts';

interface FilterSummaryProps {
  probabilities: CategoryProbabilities;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const FilterSummary: React.FC<FilterSummaryProps> = ({ 
  probabilities, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  // Generate text for the summary button - adjusted without percentages
  const getSummaryText = () => {
    // Filter categories with p > 0
    const activeCategories = Object.entries(probabilities)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [__, b]) => b - a); // Sort descending by probability
    
    if (activeCategories.length === 0) {
      return 'Gleichmäßig verteilt';
    }
    
    // Render with different font sizes based on probabilities
    return (
      <span className="summary-text">
        {activeCategories.map(([key, value], index) => {
          // Calculate font size between 13px and 17px based on probability
          const min = 12;
          const grow = 6;
          const fontSize = min + (value / 100) * grow;

          return (
            <span 
              key={key} 
              style={{ 
                fontSize: `${fontSize}px`,
                // mapping: 0% → 100, 100% → 900
                fontWeight: Math.round(500 + (value / 100) * 400),
                verticalAlign: 'middle',
              }}
            >
              {index > 0 && index < activeCategories.length ? '\u00A0|\u00A0' : ''}
              {key}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <button
      className="summary-button"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {getSummaryText()}
    </button>
  );
};

export default FilterSummary;
