import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './FeedTypeSelector.css';

export type FeedType = 'search' | 'mine' | 'auto' | 'pos' | 'history';

interface FeedTypeSelectorProps {
  selectedType: FeedType;
  onTypeChange: (type: FeedType) => void;
}

const FeedTypeSelector: React.FC<FeedTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  // Original Feed-Types Array - memoized
  const feedTypes = useMemo(() => [
    { value: 'search' as FeedType, label: 'Search' },
    { value: 'mine' as FeedType, label: 'Mine' },
    { value: 'auto' as FeedType, label: 'Auto' },
    { value: 'pos' as FeedType, label: 'Pos' },
    { value: 'history' as FeedType, label: 'History' }
  ], []);

  // Hover-Status mit Debouncing
  const [isHovering, setIsHovering] = useState(false);
  
  // Layout-Typ: Entweder original oder selected-first
  const [layout, setLayout] = useState<'original' | 'selected-first'>('selected-first');
  
  // Animation Status-Tracking
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  
  // Timeouts und Refs
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Die aktuelle Button-Reihenfolge berechnen
  const getButtonOrder = useCallback((selectedLayout: 'original' | 'selected-first') => {
    if (selectedLayout === 'original') {
      return [...feedTypes]; // Original-Reihenfolge
    } else {
      // Selected-first Reihenfolge
      const selectedIndex = feedTypes.findIndex(type => type.value === selectedType);
      if (selectedIndex === -1) return [...feedTypes];
      
      return [
        ...feedTypes.slice(selectedIndex),
        ...feedTypes.slice(0, selectedIndex)
      ];
    }
  }, [feedTypes, selectedType]);
  
  // Aktuelle Buttons-Reihenfolge
  const [buttonOrder, setButtonOrder] = useState(() => getButtonOrder('selected-first'));
  
  // Wenn sich selectedType ändert, Button-Reihenfolge aktualisieren
  useEffect(() => {
    if (!isAnimating && layout === 'selected-first') {
      setButtonOrder(getButtonOrder('selected-first'));
    }
  }, [selectedType, layout, isAnimating, getButtonOrder]);
  
  // Effekt für Änderungen des Hover-Status
  useEffect(() => {
    // Keine Animation starten, wenn bereits eine läuft
    if (isAnimating) return;
    
    // Das neue Layout basierend auf Hover-Status
    const newLayout = isHovering ? 'original' : 'selected-first';
    
    // Nur ändern, wenn sich das Layout ändert
    if (newLayout !== layout) {
      // Animation starten
      setIsAnimating(true);
      setAnimationDirection(isHovering ? 'right' : 'left');
      
      // Vorhandene Timeouts löschen
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Nach Ausblenden der Buttons die Reihenfolge ändern
      animationTimeoutRef.current = setTimeout(() => {
        setLayout(newLayout);
        setButtonOrder(getButtonOrder(newLayout));
        
        // Nach Abschluss der Animation den Status zurücksetzen
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          setAnimationDirection(null);
        }, 350);
      }, 300);
    }
  }, [isHovering, layout, getButtonOrder, isAnimating]);
  
  // Debounced Mouse-Event-Handler
  const handleMouseEnter = useCallback(() => {
    // Abbrechen vorhandener Debounce-Timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Mit leichter Verzögerung Hover-Status setzen
    debounceTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 50);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    // Abbrechen vorhandener Debounce-Timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Mit leichter Verzögerung Hover-Status zurücksetzen
    debounceTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 50);
  }, []);
  
  // CSS-Klasse für Animation bestimmen
  const getAnimationClass = () => {
    if (!isAnimating) return '';
    return animationDirection === 'left' ? 'exit-left' : 'exit-right';
  };
  
  // Alle Timeouts bereinigen
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  return (
    <div 
      className={`feed-type-selector ${isHovering ? 'hovering' : 'not-hovering'} ${getAnimationClass()}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="feed-type-carousel">
        {buttonOrder.map(type => (
          <button
            key={type.value}
            className={`feed-type-button ${selectedType === type.value ? 'active' : ''}`}
            onClick={() => onTypeChange(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedTypeSelector;