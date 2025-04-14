import React, { useState } from 'react';
import '../../styles/BubbleControls.css';

interface BubbleControlsProps {
  onZoomChange: (zoom: number) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

const BubbleControls: React.FC<BubbleControlsProps> = ({ 
  onZoomChange, 
  onSpeedChange, 
  onReset 
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(5);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    onZoomChange(newZoom);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const handleReset = () => {
    setZoom(1);
    setSpeed(5);
    onReset();
  };

  return (
    <div className="bubble-controls">
      <div className="control-group">
        <label htmlFor="zoom-control">Zoom:</label>
        <input
          id="zoom-control"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={zoom}
          onChange={handleZoomChange}
        />
        <span className="value-display">{zoom.toFixed(1)}x</span>
      </div>

      <div className="control-group">
        <label htmlFor="speed-control">Geschwindigkeit:</label>
        <input
          id="speed-control"
          type="range"
          min="1"
          max="10"
          step="1"
          value={speed}
          onChange={handleSpeedChange}
        />
        <span className="value-display">{speed}</span>
      </div>

      <button className="reset-button" onClick={handleReset}>
        Zurücksetzen
      </button>
    </div>
  );
};

export default BubbleControls;