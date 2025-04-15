import React from 'react';
import '../../styles/FilterControls.css';

interface Filters {
  beauty: boolean;
  wisdom: boolean;
  humor: boolean;
  timeRange: string;
}

interface FilterControlsProps {
  filters?: Filters;
  onFilterChange?: (type: string, value: boolean | string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ 
  filters = { beauty: false, wisdom: false, humor: false, timeRange: 'all' },
  onFilterChange = () => {}
}) => {
  const handleCategoryChange = (category: 'beauty' | 'wisdom' | 'humor') => {
    onFilterChange(category, !filters[category]);
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('timeRange', e.target.value);
  };

  return (
    <div className="filter-controls">
      <div className="filter-section">
        <div className="filter-section-title">Kategorien</div>
        <div className="filter-buttons">
          <label className={`filter-checkbox ${filters.beauty ? 'active' : ''}`}>
            <input 
              type="checkbox" 
              checked={filters.beauty} 
              onChange={() => handleCategoryChange('beauty')} 
            />
            <span>Schön</span>
          </label>
          
          <label className={`filter-checkbox ${filters.wisdom ? 'active' : ''}`}>
            <input 
              type="checkbox" 
              checked={filters.wisdom} 
              onChange={() => handleCategoryChange('wisdom')} 
            />
            <span>Weise</span>
          </label>
          
          <label className={`filter-checkbox ${filters.humor ? 'active' : ''}`}>
            <input 
              type="checkbox" 
              checked={filters.humor} 
              onChange={() => handleCategoryChange('humor')} 
            />
            <span>Lustig</span>
          </label>
        </div>
      </div>
      
      <div className="filter-section">
        <div className="filter-section-title">Zeitraum</div>
        <div className="time-filter">
          <select 
            value={filters.timeRange} 
            onChange={handleTimeRangeChange}
          >
            <option value="hour">Letzte Stunde</option>
            <option value="day">Heute</option>
            <option value="week">Diese Woche</option>
            <option value="month">Diesen Monat</option>
            <option value="year">Dieses Jahr</option>
            <option value="all">Alle Zeiten</option>
          </select>
        </div>
      </div>
      
      {/* Anzeige der aktiven Filter als Tags */}
      {(filters.beauty || filters.wisdom || filters.humor || filters.timeRange !== 'all') && (
        <div className="active-filters">
          {filters.beauty && (
            <div className="filter-tag beauty">
              Schön
              <span 
                className="filter-tag-remove" 
                onClick={() => onFilterChange('beauty', false)}
              >×</span>
            </div>
          )}
          
          {filters.wisdom && (
            <div className="filter-tag wisdom">
              Weise
              <span 
                className="filter-tag-remove" 
                onClick={() => onFilterChange('wisdom', false)}
              >×</span>
            </div>
          )}
          
          {filters.humor && (
            <div className="filter-tag humor">
              Lustig
              <span 
                className="filter-tag-remove" 
                onClick={() => onFilterChange('humor', false)}
              >×</span>
            </div>
          )}
          
          {filters.timeRange !== 'all' && (
            <div className="filter-tag time">
              {filters.timeRange === 'hour' && 'Letzte Stunde'}
              {filters.timeRange === 'day' && 'Heute'}
              {filters.timeRange === 'week' && 'Diese Woche'}
              {filters.timeRange === 'month' && 'Diesen Monat'}
              {filters.timeRange === 'year' && 'Dieses Jahr'}
              <span 
                className="filter-tag-remove" 
                onClick={() => onFilterChange('timeRange', 'all')}
              >×</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls;