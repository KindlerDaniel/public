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
  return (
    <div className="category-filter-buttons">
      <div className="category-group">
        <button 
          className={`category-button positive beauty ${categories.beauty.positive ? 'selected' : ''}`}
          onClick={() => onCategoryChange('beauty', true)}
        >
          schön
        </button>
        <button 
          className={`category-button negative beauty ${categories.beauty.negative ? 'selected' : ''}`}
          onClick={() => onCategoryChange('beauty', false)}
        >
          unschön
        </button>
      </div>
      
      <div className="category-group">
        <button 
          className={`category-button positive humor ${categories.humor.positive ? 'selected' : ''}`}
          onClick={() => onCategoryChange('humor', true)}
        >
          lustig
        </button>
        <button 
          className={`category-button negative humor ${categories.humor.negative ? 'selected' : ''}`}
          onClick={() => onCategoryChange('humor', false)}
        >
          unlustig
        </button>
      </div>
      
      <div className="category-group">
        <button 
          className={`category-button positive wisdom ${categories.wisdom.positive ? 'selected' : ''}`}
          onClick={() => onCategoryChange('wisdom', true)}
        >
          klug
        </button>
        <button 
          className={`category-button negative wisdom ${categories.wisdom.negative ? 'selected' : ''}`}
          onClick={() => onCategoryChange('wisdom', false)}
        >
          unklug
        </button>
      </div>
    </div>
  );
};

export default CategoryFilterButtons;