import React, { useRef, useEffect } from 'react';
import { TimeRange } from '../shared/TimeSelector.tsx';
import FilterControls from '../shared/FilterControls/index.tsx';
import TimeSelector from '../shared/TimeSelector.tsx';
import BubbleCanvas from './BubbleCanvas.tsx';
import { useBubbleState } from './useBubbleState.tsx';
import { setupBubbleEventHandlers } from './BubbleEventHandlers.ts';
import { CategoryProbabilities } from '../shared/FilterControls/types.ts';

interface BubbleViewProps {
  onContentSelect?: (contentId: string) => void;
}

const BubbleView: React.FC<BubbleViewProps> = ({ onContentSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [
    { zoom, rotation, isDragging, lastMousePos, contents, selectedTimeRange },
    { setZoom, setRotation, setIsDragging, setLastMousePos, setCategoryProbabilities, setSelectedTimeRange }
  ] = useBubbleState();

  useEffect(() => {
    const cleanup = setupBubbleEventHandlers({
      canvasRef,
      zoom,
      setZoom,
      rotation,
      setRotation,
      isDragging,
      setIsDragging,
      lastMousePos,
      setLastMousePos,
      contents,
      onContentSelect
    });
    
    return cleanup;
  }, [
    zoom, 
    rotation, 
    isDragging, 
    lastMousePos, 
    contents, 
    onContentSelect, 
    setZoom, 
    setRotation, 
    setIsDragging, 
    setLastMousePos
  ]);

  // Handler für Wahrscheinlichkeitsänderungen
  const handleProbabilityChange = (probabilities: CategoryProbabilities) => {
    setCategoryProbabilities(probabilities);
  };

  // Handler für Zeit-Änderungen
  const handleTimeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
  };

  return (
    <div className="bubble-view" ref={containerRef}>
      <div className="bubble-container">
        <BubbleCanvas
          contents={contents}
          zoom={zoom}
          rotation={rotation}
          isDragging={isDragging}
          onContentSelect={onContentSelect}
        />
      </div>
      
      <div className="controls-container">
        {/* Neue wahrscheinlichkeitsbasierte Filter-Kontrollen */}
        <FilterControls
          onProbabilityChange={handleProbabilityChange}
        />
        
        {/* Zeit-Selektor */}
        <TimeSelector 
          selectedTime={selectedTimeRange}
          onTimeChange={handleTimeChange}
        />
      </div>
    </div>
  );
};

export default BubbleView;