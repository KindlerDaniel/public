import React, { useState } from 'react';
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

// Mapping für Zusammenfassungstext
const labelMap: Record<keyof CategoryFilters, { positive: string; negative: string }> = {
  wisdom: { positive: 'wise', negative: 'stupid' },
  beauty: { positive: 'beautiful', negative: 'repulsive' },
  humor:  { positive: 'funny', negative: 'unfunny'  },
};

const CategoryFilterButtons: React.FC<CategoryFilterButtonsProps> = ({ categories, onCategoryChange }) => {
  const [hovered, setHovered] = useState(false);

  const handleCategoryClick = (category: string, isPositive: boolean) => {
    const key = category as keyof CategoryFilters;
    const current = categories[key];
    if (isPositive && current.negative) {
      onCategoryChange(category, false);
      onCategoryChange(category, true);
    } else if (!isPositive && current.positive) {
      onCategoryChange(category, true);
      onCategoryChange(category, false);
    } else {
      onCategoryChange(category, isPositive);
    }
  };

  // Feste Reihenfolge für die Zusammenfassung: wise, beautiful, funny
  const orderedKeys: (keyof CategoryFilters)[] = ['wisdom', 'beauty', 'humor'];

  // Labels gemäß Auswahl und Reihenfolge zusammenstellen
  const selectedLabels = orderedKeys
    .filter(key => categories[key].positive || categories[key].negative)
    .map(key => categories[key].positive ? labelMap[key].positive : labelMap[key].negative);

  const summaryText = selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Keine Auswahl';

  return (
    <div className="category-filter-container">
      {!hovered ? (
        <button
          className={`summary-button ${selectedLabels.length > 0 ? 'selected' : ''}`}
          onMouseEnter={() => setHovered(true)}
        >
          {summaryText}
        </button>
      ) : (
        <div className="category-filter-buttons" onMouseLeave={() => setHovered(false)}>
          {/* Wise */}
          <div className="category-group">
            <button
              className={`category-button positive wisdom ${categories.wisdom.positive ? 'selected' : ''}`}
              onClick={() => handleCategoryClick('wisdom', true)}
            >wise</button>
            <button
              className={`category-button negative wisdom ${categories.wisdom.negative ? 'selected' : ''}`}
              onClick={() => handleCategoryClick('wisdom', false)}
            >stupid</button>
          </div>
          {/* Beautiful */}
          <div className="category-group">
            <button
              className={`category-button positive beauty ${categories.beauty.positive ? 'selected' : ''}`}
              onClick={() => handleCategoryClick('beauty', true)}
            >beautiful</button>
            <button
              className={`category-button negative beauty ${categories.beauty.negative ? 'selected' : ''}`}
              onClick={() => handleCategoryClick('beauty', false)}
            >repulsive</button>
          </div>
          {/* Funny */}
          <div className="category-group">
            <button
              className={`category-button positive humor ${categories.humor.positive ? 'selected' : ''}`}
              onClick={() => handleCategoryClick('humor', true)}
            >funny</button>
            <button
              className={`category-button negative humor ${categories.humor.negative ? 'selected' : ''}`}
              onClick={() => handleCategoryClick('humor', false)}
            >unfunny</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterButtons;

