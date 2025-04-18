import React from 'react';
import '../../styles/time-selector.css';

export type TimeRange = 'all' | '5years' | 'year' | 'month' | 'week' | 'day' | 'hour';

interface TimeSelectorProps {
  selectedTime: TimeRange;
  onTimeChange: (timeRange: TimeRange) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onTimeChange }) => {
  const timeOptions: { value: TimeRange; label: string }[] = [
    { value: 'all', label: 'ever' },
    { value: '5years', label: '5 years' },
    { value: 'year', label: 'last year' },
    { value: 'month', label: 'month' },
    { value: 'week', label: 'week' },
    { value: 'day', label: 'day' },
    { value: 'hour', label: 'hour' }
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