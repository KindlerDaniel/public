import React from 'react';
import '../../styles/time-selector.css';

export type TimeRange = 'all' | '5years' | 'year' | 'month' | 'week' | 'day' | 'hour';

interface TimeSelectorProps {
  selectedTime: TimeRange;
  onTimeChange: (timeRange: TimeRange) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onTimeChange }) => {
  const timeOptions: { value: TimeRange; label: string }[] = [
    { value: 'all', label: 'Alle' },
    { value: '5years', label: '5 Jahre' },
    { value: 'year', label: 'Jahr' },
    { value: 'month', label: 'Monat' },
    { value: 'week', label: 'Woche' },
    { value: 'day', label: 'Tag' },
    { value: 'hour', label: 'Stunde' }
  ];

  return (
    <div className="time-selector">
      <div className="time-line"></div>
      {timeOptions.map((option) => (
        <button
          key={option.value}
          className={`time-button ${selectedTime === option.value ? 'selected' : ''}`}
          onClick={() => onTimeChange(option.value)}
        >
          <div className="time-pearl"></div>
          <div className="time-label">{option.label}</div>
        </button>
      ))}
    </div>
  );
};

export default TimeSelector;