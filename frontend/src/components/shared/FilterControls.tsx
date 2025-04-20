import React, { useState, useEffect, useRef } from 'react';
import '../../styles/filter-controls.css';

// Definiert die Struktur der Wahrscheinlichkeiten für jede Kategorie
export interface CategoryProbabilities {
  wise: number;
  stupid: number;
  beautiful: number;
  repulsive: number;
  funny: number;
  unfunny: number;
}

// Props der Komponente
interface FilterControlsProps {
  onProbabilityChange: (probabilities: CategoryProbabilities) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ 
  onProbabilityChange 
}) => {
  // Anfangszustand: Wise 100%, alle anderen 0%
  const initialProbabilities: CategoryProbabilities = {
    wise: 100,
    stupid: 0,
    beautiful: 0,
    repulsive: 0,
    funny: 0,
    unfunny: 0
  };

  const [probabilities, setProbabilities] = useState<CategoryProbabilities>(initialProbabilities);
  // State zum Verfolgen von Mausaktionen
  const [activeButton, setActiveButton] = useState<keyof CategoryProbabilities | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const incrementInterval = useRef<NodeJS.Timeout | null>(null);
  const holdStartTime = useRef<number | null>(null);
  const wasLongPressed = useRef(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getProbabilityColor = (probability: number) => {
    // Start‑Hue (Cyan) und End‑Hue (Magenta)
    const hStart = 170;
    const hEnd   = 340;
  
    // Normierung auf [0…1]
    const t = Math.max(0, Math.min(probability, 100)) / 100;
  
    // Hue linear interpolieren und modulo 360
    const h = (hStart + (hEnd - hStart) * t) % 360;
  
    // Sättigung: mit Exponent 0.2 → sehr schneller Anstieg am Anfang, flacht stark ab
    const s = Math.pow(t, 0.2) * 100;
  
    // Licht: von 100% (Weiß) auf 50% (normaler Farbton) linear
    const l = 100 - 50 * t;
  
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  };
  
  
  // Erhöht die Wahrscheinlichkeit für einen Button und reduziert die anderen proportional
  const incrementProbability = (button: keyof CategoryProbabilities) => {
      setProbabilities(prev => {
      // Kopie der aktuellen Werte
      const newProbabilities = { ...prev };
      
      // Gegensätzliche Paare definieren
      const opposites: Record<keyof CategoryProbabilities, keyof CategoryProbabilities> = {
        wise: 'stupid',
        stupid: 'wise',
        beautiful: 'repulsive',
        repulsive: 'beautiful',
        funny: 'unfunny',
        unfunny: 'funny'
      };
      
      // Setze den gegensätzlichen Button sofort auf 0
      const oppositeButton = opposites[button];
      newProbabilities[oppositeButton] = 0;
      
      // Erhöhe die Wahrscheinlichkeit des ausgewählten Buttons um 1%
      const increment = 1;
      newProbabilities[button] += increment;
      
      // Berechne die Summe der anderen Wahrscheinlichkeiten (außer dem Gegensatz-Button)
      const otherButtons = Object.keys(newProbabilities).filter(
        key => key !== button && key !== oppositeButton
      ) as Array<keyof CategoryProbabilities>;
      
      const sumOthers = otherButtons.reduce(
        (sum, key) => sum + newProbabilities[key], 
        0
      );
      
      // Reduziere die anderen proportional
      if (sumOthers > 0) {
        const reductionFactor = (sumOthers - increment) / sumOthers;
        otherButtons.forEach(key => {
          newProbabilities[key] *= reductionFactor;
        });
      }
      
      // Runde auf 2 Nachkommastellen und stell sicher, dass die Summe 100% ist
      Object.keys(newProbabilities).forEach(key => {
        newProbabilities[key as keyof CategoryProbabilities] = 
          Math.round(newProbabilities[key as keyof CategoryProbabilities] * 100) / 100;
      });
      
      // Ausgleichen für Rundungsfehler
      const sum = Object.values(newProbabilities).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.01) {
        const adjustmentFactor = 100 / sum;
        Object.keys(newProbabilities).forEach(key => {
          newProbabilities[key as keyof CategoryProbabilities] *= adjustmentFactor;
          newProbabilities[key as keyof CategoryProbabilities] = 
            Math.round(newProbabilities[key as keyof CategoryProbabilities] * 100) / 100;
        });
      }
      
      return newProbabilities;
    });
  };

  // Effekt für das kontinuierliche Inkrement beim Halten
  useEffect(() => {
    if (activeButton) {
      // Warte 250 ms, bevor das Inkrement‑Intervall startet
      const startTimeout = setTimeout(() => {
        incrementInterval.current = setInterval(() => {
          incrementProbability(activeButton);
        }, 20);
      }, 250);
  
      return () => {
        // räume sowohl Timeout als auch (falls gesetzt) das Intervall wieder auf
        clearTimeout(startTimeout);
        if (incrementInterval.current) {
          clearInterval(incrementInterval.current);
          incrementInterval.current = null;
        }
      };
    }
  }, [activeButton]);

  // Wenn sich die Wahrscheinlichkeiten ändern, informiere die übergeordnete Komponente
  useEffect(() => {
    onProbabilityChange(probabilities);
  }, [probabilities, onProbabilityChange]);

  // Handler für Mausaktionen
  const handleMouseDown = (button: keyof CategoryProbabilities) => {
    holdStartTime.current = Date.now();
    wasLongPressed.current = false;
    setActiveButton(button);
  };

  const handleMouseUp = () => {
    const wasHeldLongEnough = 
      holdStartTime.current && 
      (Date.now() - holdStartTime.current > 250); // Länger als 250ms = Halten
    
    if (wasHeldLongEnough) {
      // Es war ein langes Drücken, kein Klick verarbeiten
      wasLongPressed.current = true;
    } else if (activeButton && !wasLongPressed.current) {
      // Es war ein kurzer Klick, handleClick ausführen
      handleClick(activeButton);
    }
    
    holdStartTime.current = null;
    setActiveButton(null);
  };

  const handleMouseEnter = () => {
    // Verzögerung für den Hover-Effekt hinzufügen
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 60);
  };

  const handleMouseLeave = () => {
    // Timer löschen, wenn die Maus den Bereich verlässt
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (holdStartTime.current) {
      const wasHeldLongEnough = Date.now() - holdStartTime.current > 250;
      wasLongPressed.current = wasHeldLongEnough;
    }
    
    holdStartTime.current = null;
    setActiveButton(null);
    setIsHovered(false);
  };

  // Wenn ein Button kurz geklickt wird, verteile die Wahrscheinlichkeit zu gleichen Teilen auf alle Buttons mit p > 0
  const handleClick = (button: keyof CategoryProbabilities) => {

    setProbabilities(prev => {
      const newProbabilities = { ...prev };
      
      // Gegensätzliche Paare definieren
      const opposites: Record<keyof CategoryProbabilities, keyof CategoryProbabilities> = {
        wise: 'stupid',
        stupid: 'wise',
        beautiful: 'repulsive',
        repulsive: 'beautiful',
        funny: 'unfunny',
        unfunny: 'funny'
      };
      
      // Setze den gegensätzlichen Button auf 0
      const oppositeButton = opposites[button];
      newProbabilities[oppositeButton] = 0;
      
      // Prüfe, ob der Button bereits eine Wahrscheinlichkeit > 0 hat
      if (newProbabilities[button] > 0) {
        console.log(newProbabilities[button])

        // Setze diesen Button auf 0
        newProbabilities[button] = 0;
        
        // Sammle alle aktiven Buttons (nach dem Deaktivieren)
        const activeButtons = Object.keys(newProbabilities).filter(
          key => newProbabilities[key as keyof CategoryProbabilities] > 0
        );
        
        // Wenn noch aktive Buttons übrig sind, verteile die 100% gleichmäßig
        if (activeButtons.length > 0) {
          const equalShare = 100 / activeButtons.length;
          
          Object.keys(newProbabilities).forEach(key => {
            if (activeButtons.includes(key)) {
              newProbabilities[key as keyof CategoryProbabilities] = equalShare;
            } else {
              newProbabilities[key as keyof CategoryProbabilities] = 0;
            }
          });
        } else {
          // Wenn keine aktiven Buttons übrig sind, setze diesen Button auf 100%
          newProbabilities[button] = 100;
        }
      } else {
          // Button aktivieren
          // Sammle alle bisher aktiven Buttons (ohne den Gegenspieler)
          const activeButtons = (Object.keys(newProbabilities) as Array<keyof CategoryProbabilities>)
          .filter(key =>
            newProbabilities[key] > 0 &&
            key !== oppositeButton
          );

          // Füge den gerade geklickten Button hinzu, falls noch nicht enthalten
          if (!activeButtons.includes(button)) {
            activeButtons.push(button);
          }

          // Verteile die Gesamtwahrscheinlichkeit gleichmäßig
          const equalShare = parseFloat((100 / activeButtons.length).toFixed(2));
          (Object.keys(newProbabilities) as Array<keyof CategoryProbabilities>).forEach(key => {
            newProbabilities[key] = activeButtons.includes(key)
              ? equalShare
              : 0;
          });
      }
      
      // Runde auf 2 Nachkommastellen
      Object.keys(newProbabilities).forEach(key => {
        newProbabilities[key as keyof CategoryProbabilities] = 
          Math.round(newProbabilities[key as keyof CategoryProbabilities] * 100) / 100;
      });
      
      return newProbabilities;
    });
  };

  // Text für den Zusammenfassungsbutton generieren - angepasst ohne Prozentangaben
  const getSummaryText = () => {
    // Filter Kategorien mit p > 0
    const activeCategories = Object.entries(probabilities)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [__, b]) => b - a); // Sortiere absteigend nach Wahrscheinlichkeit
    
    if (activeCategories.length === 0) {
      return 'Gleichmäßig verteilt';
    }
    
    // Rendern mit unterschiedlichen Schriftgrößen basierend auf den Wahrscheinlichkeiten
    return (
      <span className="summary-text">
        {activeCategories.map(([key, value], index) => {

          // Berechne Schriftgröße zwischen 13px und 17px basierend auf der Wahrscheinlichkeit
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

  // Cleanup-Effekt für den Hover-Timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="category-filter-container">
      {!isHovered ? (
        <button
          className="summary-button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {getSummaryText()}
        </button>
      ) : (
        <div className="category-filter-buttons" onMouseLeave={handleMouseLeave}>
          {/* Wise & Stupid */}
          <div className="category-group">
            <button
              className={`category-button positive wisdom ${probabilities.wise > 0 ? 'selected' : ''}`}
              style={{
                backgroundColor: probabilities.wise > 0 
                  ? getProbabilityColor(probabilities.wise) 
                  : 'white',
                color: 'black'
              }}
              onMouseDown={() => handleMouseDown('wise')}
              onMouseUp={handleMouseUp}
            >
              wise
            </button>
            <button
              className={`category-button negative wisdom ${probabilities.stupid > 0 ? 'selected' : ''}`}
              style={{
                backgroundColor: probabilities.stupid > 0 
                  ? getProbabilityColor(probabilities.stupid) 
                  : 'white',
                color: 'black'
              }}
              onMouseDown={() => handleMouseDown('stupid')}
              onMouseUp={handleMouseUp}
            >
              stupid
            </button>
          </div>
          
          {/* Beautiful & Repulsive */}
          <div className="category-group">
            <button
              className={`category-button positive beauty ${probabilities.beautiful > 0 ? 'selected' : ''}`}
              style={{
                backgroundColor: probabilities.beautiful > 0 
                  ? getProbabilityColor(probabilities.beautiful) 
                  : 'white',
                color: 'black'
              }}
              onMouseDown={() => handleMouseDown('beautiful')}
              onMouseUp={handleMouseUp}
            >
              beautiful
            </button>
            <button
              className={`category-button negative beauty ${probabilities.repulsive > 0 ? 'selected' : ''}`}
              style={{
                backgroundColor: probabilities.repulsive > 0 
                  ? getProbabilityColor(probabilities.repulsive) 
                  : 'white',
                color: 'black'
              }}
              onMouseDown={() => handleMouseDown('repulsive')}
              onMouseUp={handleMouseUp}
            >
              repulsive
            </button>
          </div>
          
          {/* Funny & Unfunny */}
          <div className="category-group">
            <button
              className={`category-button positive humor ${probabilities.funny > 0 ? 'selected' : ''}`}
              style={{
                backgroundColor: probabilities.funny > 0 
                  ? getProbabilityColor(probabilities.funny) 
                  : 'white',
                color: 'black'
              }}
              onMouseDown={() => handleMouseDown('funny')}
              onMouseUp={handleMouseUp}
            >
              funny
            </button>
            <button
              className={`category-button negative humor ${probabilities.unfunny > 0 ? 'selected' : ''}`}
              style={{
                backgroundColor: probabilities.unfunny > 0 
                  ? getProbabilityColor(probabilities.unfunny) 
                  : 'white',
                color: 'black'
              }}
              onMouseDown={() => handleMouseDown('unfunny')}
              onMouseUp={handleMouseUp}
            >
              unfunny
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;