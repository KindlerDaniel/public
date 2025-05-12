// Custom hook to encapsulate filter logic

import { useCallback, useMemo } from 'react';
import { CategoryProbabilities, CategoryKey } from './types.ts';

export const useFilterLogic = (
  probabilities: CategoryProbabilities,
  setProbabilities: React.Dispatch<React.SetStateAction<CategoryProbabilities>>
) => {
  // Define opposite pairs - use useMemo to avoid recreating this object on every render
  const opposites = useMemo<Record<CategoryKey, CategoryKey>>(() => ({
    wise: 'stupid',
    stupid: 'wise',
    beautiful: 'repulsive',
    repulsive: 'beautiful',
    funny: 'unfunny',
    unfunny: 'funny'
  }), []);

  // Calculate color based on probability
  const getProbabilityColor = useCallback((probability: number) => {
    // Start‑Hue (Cyan) and End‑Hue (Magenta)
    const hStart = 170;
    const hEnd = 340;
  
    // Normalize to [0…1]
    const t = Math.max(0, Math.min(probability, 100)) / 100;
  
    // Interpolate hue linearly and modulo 360
    const h = (hStart + (hEnd - hStart) * t) % 360;
  
    // Saturation: with exponent 0.2 → very fast increase at the beginning, flattens strongly
    const s = Math.pow(t, 0.2) * 100;
  
    // Light: from 100% (White) to 50% (normal tone) linear
    const l = 100 - 50 * t;
  
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }, []);
  
  // Increment probability for a button and reduce others proportionally
  const incrementProbability = useCallback((button: CategoryKey) => {
    setProbabilities(prev => {
      // Copy of current values
      const newProbabilities = { ...prev };
      
      // Set the opposite button immediately to 0
      const oppositeButton = opposites[button];
      newProbabilities[oppositeButton] = 0;
      
      // Increase the probability of the selected button by 1%
      const increment = 1;
      newProbabilities[button] += increment;
      
      // Calculate the sum of other probabilities (except the opposite button)
      const otherButtons = Object.keys(newProbabilities).filter(
        key => key !== button && key !== oppositeButton
      ) as Array<CategoryKey>;
      
      const sumOthers = otherButtons.reduce(
        (sum, key) => sum + newProbabilities[key], 
        0
      );
      
      // Reduce others proportionally
      if (sumOthers > 0) {
        const reductionFactor = (sumOthers - increment) / sumOthers;
        otherButtons.forEach(key => {
          newProbabilities[key] *= reductionFactor;
        });
      }
      
      // Round to 2 decimal places and ensure the sum is 100%
      Object.keys(newProbabilities).forEach(key => {
        newProbabilities[key as CategoryKey] = 
          Math.round(newProbabilities[key as CategoryKey] * 100) / 100;
      });
      
      // Adjust for rounding errors
      const sum = Object.values(newProbabilities).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.01) {
        const adjustmentFactor = 100 / sum;
        Object.keys(newProbabilities).forEach(key => {
          newProbabilities[key as CategoryKey] *= adjustmentFactor;
          newProbabilities[key as CategoryKey] = 
            Math.round(newProbabilities[key as CategoryKey] * 100) / 100;
        });
      }
      
      return newProbabilities;
    });
  }, [opposites, setProbabilities]);

  // Handle button click
  const handleClick = useCallback((button: CategoryKey) => {
    setProbabilities(prev => {
      const newProbabilities = { ...prev };
      
      // Set the opposite button to 0
      const oppositeButton = opposites[button];
      newProbabilities[oppositeButton] = 0;
      
      // Check if the button already has a probability > 0
      if (newProbabilities[button] > 0) {
        // Set this button to 0
        newProbabilities[button] = 0;
        
        // Collect all active buttons (after deactivation)
        const activeButtons = Object.keys(newProbabilities).filter(
          key => newProbabilities[key as CategoryKey] > 0
        );
        
        // If active buttons remain, distribute the 100% evenly
        if (activeButtons.length > 0) {
          const equalShare = 100 / activeButtons.length;
          
          Object.keys(newProbabilities).forEach(key => {
            if (activeButtons.includes(key)) {
              newProbabilities[key as CategoryKey] = equalShare;
            } else {
              newProbabilities[key as CategoryKey] = 0;
            }
          });
        } else {
          // If no active buttons remain, set this button to 100%
          newProbabilities[button] = 100;
        }
      } else {
        // Button activate
        // Collect all previously active buttons (without the opponent)
        const activeButtons = (Object.keys(newProbabilities) as Array<CategoryKey>)
          .filter(key =>
            newProbabilities[key] > 0 &&
            key !== oppositeButton
          );

        // Add the just clicked button if not already included
        if (!activeButtons.includes(button)) {
          activeButtons.push(button);
        }

        // Distribute the total probability evenly
        const equalShare = parseFloat((100 / activeButtons.length).toFixed(2));
        (Object.keys(newProbabilities) as Array<CategoryKey>).forEach(key => {
          newProbabilities[key] = activeButtons.includes(key)
            ? equalShare
            : 0;
        });
      }
      
      // Round to 2 decimal places
      Object.keys(newProbabilities).forEach(key => {
        newProbabilities[key as CategoryKey] = 
          Math.round(newProbabilities[key as CategoryKey] * 100) / 100;
      });
      
      return newProbabilities;
    });
  }, [opposites, setProbabilities]);

  return {
    incrementProbability,
    handleClick,
    getProbabilityColor
  };
};