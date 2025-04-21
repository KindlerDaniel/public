// Group of positive and negative category buttons

import React, { useState, useRef, useEffect } from 'react';
import { CategoryProbabilities, CategoryKey } from './types.ts';
import CategoryButton from './CategoryButton.tsx';

interface CategoryButtonGroupProps {
  positiveCategory: CategoryKey;
  negativeCategory: CategoryKey;
  probabilities: CategoryProbabilities;
  getProbabilityColor: (probability: number) => string;
  incrementProbability: (button: CategoryKey) => void;
  handleClick: (button: CategoryKey) => void;
}

const CategoryButtonGroup: React.FC<CategoryButtonGroupProps> = ({
  positiveCategory,
  negativeCategory,
  probabilities,
  getProbabilityColor,
  incrementProbability,
  handleClick
}) => {
  const [activeButton, setActiveButton] = useState<CategoryKey | null>(null);
  const incrementInterval = useRef<NodeJS.Timeout | null>(null);
  const holdStartTime = useRef<number | null>(null);
  const wasLongPressed = useRef(false);

  // Effect for handling the increment interval
  useEffect(() => {
    let startTimeout: NodeJS.Timeout | null = null;
    
    if (activeButton) {
      // Wait 250 ms before starting the increment interval
      startTimeout = setTimeout(() => {
        incrementInterval.current = setInterval(() => {
          incrementProbability(activeButton);
        }, 20);
      }, 250);
    }
    
    // Cleanup function
    return () => {
      if (startTimeout) {
        clearTimeout(startTimeout);
      }
      if (incrementInterval.current) {
        clearInterval(incrementInterval.current);
        incrementInterval.current = null;
      }
    };
  }, [activeButton, incrementProbability]);

  const handleMouseDown = (button: CategoryKey) => {
    holdStartTime.current = Date.now();
    wasLongPressed.current = false;
    setActiveButton(button);
  };

  const handleMouseUp = () => {
    const wasHeldLongEnough = 
      holdStartTime.current && 
      (Date.now() - holdStartTime.current > 250); // Longer than 250ms = hold
    
    if (wasHeldLongEnough) {
      // It was a long press, don't process click
      wasLongPressed.current = true;
    } else if (activeButton && !wasLongPressed.current) {
      // It was a short click, execute handleClick
      handleClick(activeButton);
    }
    
    holdStartTime.current = null;
    setActiveButton(null);
    
    if (incrementInterval.current) {
      clearInterval(incrementInterval.current);
      incrementInterval.current = null;
    }
  };

  return (
    <div className="category-group">
      <CategoryButton
        category={positiveCategory}
        isPositive={true}
        isSelected={probabilities[positiveCategory] > 0}
        probability={probabilities[positiveCategory]}
        getColor={getProbabilityColor}
        onMouseDown={() => handleMouseDown(positiveCategory)}
        onMouseUp={handleMouseUp}
      />
      <CategoryButton
        category={negativeCategory}
        isPositive={false}
        isSelected={probabilities[negativeCategory] > 0}
        probability={probabilities[negativeCategory]}
        getColor={getProbabilityColor}
        onMouseDown={() => handleMouseDown(negativeCategory)}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default CategoryButtonGroup;