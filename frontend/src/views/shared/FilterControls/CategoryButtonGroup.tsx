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
  setCategoryTo100Percent: (button: CategoryKey) => void; // New prop
}

const CategoryButtonGroup: React.FC<CategoryButtonGroupProps> = ({
  positiveCategory,
  negativeCategory,
  probabilities,
  getProbabilityColor,
  incrementProbability,
  handleClick,
  setCategoryTo100Percent // New prop
}) => {
  const [activeButton, setActiveButton] = useState<CategoryKey | null>(null);
  const incrementInterval = useRef<NodeJS.Timeout | null>(null);
  const holdStartTime = useRef<number | null>(null);
  const wasLongPressed = useRef(false);
  
  // Double-click handling
  const lastClickTime = useRef<{ [key in CategoryKey]?: number }>({});
  const doubleClickTimeout = 300; // ms window for double-click

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

  const handleMouseUp = (button: CategoryKey) => {
    const now = Date.now();
    const wasHeldLongEnough = 
      holdStartTime.current && 
      (now - holdStartTime.current > 250); // Longer than 250ms = hold
    
    // Check for double-click
    const lastClick = lastClickTime.current[button] || 0;
    const isDoubleClick = now - lastClick < doubleClickTimeout;
    
    if (isDoubleClick) {
      // Double-click detected - set this button to 100%
      setCategoryTo100Percent(button);
      // Reset last click time to avoid triple-click detection
      lastClickTime.current[button] = 0;
    } else if (wasHeldLongEnough) {
      // It was a long press, don't process click
      wasLongPressed.current = true;
      // Update last click time
      lastClickTime.current[button] = now;
    } else if (activeButton && !wasLongPressed.current) {
      // It was a short click, execute handleClick
      handleClick(activeButton);
      // Update last click time
      lastClickTime.current[button] = now;
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
        onMouseUp={() => handleMouseUp(positiveCategory)}
      />
      <CategoryButton
        category={negativeCategory}
        isPositive={false}
        isSelected={probabilities[negativeCategory] > 0}
        probability={probabilities[negativeCategory]}
        getColor={getProbabilityColor}
        onMouseDown={() => handleMouseDown(negativeCategory)}
        onMouseUp={() => handleMouseUp(negativeCategory)}
      />
    </div>
  );
};

export default CategoryButtonGroup;