import React, { useState, useEffect, useRef } from 'react';
import './FeedTypeSelector.css';

export type FeedType = 'search' | 'mine' | 'auto' | 'pos' | 'history';

interface FeedTypeSelectorProps {
  selectedType: FeedType;
  onTypeChange: (type: FeedType) => void;
}

const FeedTypeSelector: React.FC<FeedTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  // Statische Feed-Types für die Buttons
  const feedTypes = [
    { value: 'search' as FeedType, label: 'Search' },
    { value: 'mine' as FeedType, label: 'Mine' },
    { value: 'auto' as FeedType, label: 'Auto' },
    { value: 'pos' as FeedType, label: 'Pos' },
    { value: 'history' as FeedType, label: 'History' }
  ];

  // Hover- und Animation-Status
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs für die Animation
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Finde den ausgewählten Index
  const selectedIndex = feedTypes.findIndex(type => type.value === selectedType);
  
  // Berechne die Button-Reihenfolge basierend auf dem Hover-Status
  const getButtonOrder = () => {
    if (isHovering) {
      // Normale Reihenfolge im Hover-Zustand
      return [...feedTypes];
    } else {
      // Rotierte Reihenfolge, so dass der ausgewählte Button zuerst kommt
      return [
        ...feedTypes.slice(selectedIndex),
        ...feedTypes.slice(0, selectedIndex)
      ];
    }
  };
  
  // Aktualisiere die Animation beim Statuswechsel
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
  setIsAnimating(false);
}, 1200); // Angepasst an die längere CSS-Transition-Dauer
    
    return () => clearTimeout(timer);
  }, [isHovering, selectedType]);

  // Handler für Mouse-Events mit Debouncing
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 50);
  };
  
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 50);
  };

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`feed-type-selector ${isHovering ? 'hovering' : 'not-hovering'} ${isAnimating ? 'animating' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="feed-type-container">
        {getButtonOrder().map((type, index) => {
          // Bestimme, ob dieser Button der aktive ist
          const isActive = type.value === selectedType;
          
          // Bestimme die Original-Position dieses Buttons
          const originalIndex = feedTypes.findIndex(t => t.value === type.value);
          
          return (
            <button
              key={type.value}
              className={`feed-type-button ${isActive ? 'active' : ''}`}
              style={{
                // Die Index-Position bestimmt die Reihenfolge
                order: index,
                // Anzeigen basierend auf Hover oder aktiver Status
                opacity: isHovering || isActive ? 1 : 0,
                // Sichtbarkeit erhöht die Zugänglichkeit
                visibility: isHovering || isActive ? 'visible' : 'hidden',
                // Setzt einen data-attribute für potenzielle CSS-Selektoren
                '--original-index': originalIndex
              } as React.CSSProperties}
              onClick={() => onTypeChange(type.value)}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FeedTypeSelector;