import React from 'react';
import '../../styles/filter-controls.css';

// Definiert die Struktur des Kategorie-Filters
export interface CategoryFilter {
  positive: boolean;
  negative: boolean;
}

// Definiert alle Kategorie-Filterzustände
export interface CategoryFilters {
  beauty: CategoryFilter;
  humor: CategoryFilter;
  wisdom: CategoryFilter;
}

// Props der Komponente
interface CategoryFilterButtonsProps {
  categories: CategoryFilters;
  onCategoryChange: (category: string, isPositive: boolean) => void;
}

/**
 * Wiederverwendbare Komponente zur Anzeige von Kategorie-Filterbuttons
 * Die Komponente zeigt drei Kategorien mit je zwei Buttons (positiv/negativ)
 */
const CategoryFilterButtons: React.FC<CategoryFilterButtonsProps> = ({ 
  categories, 
  onCategoryChange 
}) => {
  // Erweiterte Handler-Funktion für Kategorie-Änderungen
  const handleCategoryClick = (category: string, isPositive: boolean) => {
    // Wenn bereits die entgegengesetzte Option ausgewählt ist, deaktiviere sie automatisch
    const categoryKey = category as keyof CategoryFilters;
    const currentState = categories[categoryKey];
    
    // Wenn die positive Option geklickt wurde und die negative aktuell aktiv ist,
    // oder wenn die negative Option geklickt wurde und die positive aktuell aktiv ist,
    // müssen wir beide Aufrufe machen
    if (isPositive && currentState.negative) {
      // Deaktiviere zuerst die negative Option
      onCategoryChange(category, false);
      // Dann aktiviere/deaktiviere die positive Option
      onCategoryChange(category, true);
    } else if (!isPositive && currentState.positive) {
      // Deaktiviere zuerst die positive Option
      onCategoryChange(category, true);
      // Dann aktiviere/deaktiviere die negative Option
      onCategoryChange(category, false);
    } else {
      // Standardverhalten: einfach den Status umschalten
      onCategoryChange(category, isPositive);
    }
  };

  return (
    <div className="category-filter-buttons">
      <div className="category-group">
        <button 
          className={`category-button positive beauty ${categories.beauty.positive ? 'selected' : ''}`}
          onClick={() => handleCategoryClick('beauty', true)}
        >
          schön
        </button>
        <button 
          className={`category-button negative beauty ${categories.beauty.negative ? 'selected' : ''}`}
          onClick={() => handleCategoryClick('beauty', false)}
        >
          unschön
        </button>
      </div>
      
      <div className="category-group">
        <button 
          className={`category-button positive humor ${categories.humor.positive ? 'selected' : ''}`}
          onClick={() => handleCategoryClick('humor', true)}
        >
          lustig
        </button>
        <button 
          className={`category-button negative humor ${categories.humor.negative ? 'selected' : ''}`}
          onClick={() => handleCategoryClick('humor', false)}
        >
          unlustig
        </button>
      </div>
      
      <div className="category-group">
        <button 
          className={`category-button positive wisdom ${categories.wisdom.positive ? 'selected' : ''}`}
          onClick={() => handleCategoryClick('wisdom', true)}
        >
          klug
        </button>
        <button 
          className={`category-button negative wisdom ${categories.wisdom.negative ? 'selected' : ''}`}
          onClick={() => handleCategoryClick('wisdom', false)}
        >
          unklug
        </button>
      </div>
    </div>
  );
};

export default CategoryFilterButtons;