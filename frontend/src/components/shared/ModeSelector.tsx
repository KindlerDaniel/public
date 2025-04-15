import React from 'react';
import '../../styles/ModeSelector.css'; // Korrektur des Pfads für CSS-Import

interface ModeSelectorProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    { id: 'society', label: 'Society' },
    { id: 'group', label: 'Group' },
    { id: 'chat', label: 'Chat' },
    { id: 'personal', label: 'Personal' }
  ];

  return (
    <div className="mode-selector">
      <span className="mode-selector-label">Mode:</span>
      <div className="mode-options">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-option ${mode.id} ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => onModeChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;