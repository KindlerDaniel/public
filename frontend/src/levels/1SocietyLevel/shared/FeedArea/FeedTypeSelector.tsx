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
  const [isAnimating] = useState(false);
  
  // Refs für die Animation und Größenanpassung
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
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

  // Handler für Mouse-Events mit Debouncing
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);
    });
  };
  
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    });
  };

  // Funktion zur Aktualisierung der Schriftgröße basierend auf der Buttonbreite
  const updateFontSizes = () => {
    if (!buttonRefs.current) return;
    
    buttonRefs.current.forEach((buttonRef) => {
      if (!buttonRef) return;
      
      const buttonWidth = buttonRef.offsetWidth;
      if (buttonWidth <= 0) return; // Skip if button has no width yet
      
      const textLength = buttonRef.textContent?.length || 1;
      
      // Berechnung eines Skalierungsfaktors basierend auf Button-Breite und Text-Länge
      // Diese Formel kann an Ihre spezifischen Bedürfnisse angepasst werden
      const scaleFactor = Math.min(1, buttonWidth / (textLength * 9));
      
      // CSS-Variable setzen
      buttonRef.style.setProperty('--scale-factor', scaleFactor.toString());
    });
  };

  // Aktualisiere Schriftgrößen bei Änderungen
  useEffect(() => {
    // Initialisiere den buttonRefs Array mit der korrekten Länge
    buttonRefs.current = new Array(feedTypes.length).fill(null);
    
    // Aktualisiere nach vollständigem Rendern mit setTimeout
    const initialUpdateTimeout = setTimeout(() => {
      updateFontSizes();
    }, 0);
    
    // Zusätzliche Updates für Animation und Transition-Effekte
    const timeoutIds = [
      setTimeout(updateFontSizes, 50),   // Kurz danach
      setTimeout(updateFontSizes, 150),  // Nach möglicher CSS-Transition
      setTimeout(updateFontSizes, 300)   // Sicherheitsupdate nach längerer Zeit
    ];
    
    // Beobachte Größenänderungen
    const resizeObserver = new ResizeObserver(() => {
      updateFontSizes();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      clearTimeout(initialUpdateTimeout);
      timeoutIds.forEach(clearTimeout);
      resizeObserver.disconnect();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovering, selectedType]);

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
              ref={(el: HTMLButtonElement | null) => {
                buttonRefs.current[index] = el;
              }}
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