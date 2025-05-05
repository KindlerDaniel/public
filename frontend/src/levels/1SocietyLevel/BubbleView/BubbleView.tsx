import React, { useRef, useEffect, useState } from 'react';
import './BubbleView.css';
import { TimeRange } from '../shared/TimeSelector.tsx';
import FilterControls from '../shared/FilterControls/FilterControls.tsx';
import TimeSelector from '../shared/TimeSelector.tsx';
import BubbleCanvas from './BubbleCanvas.tsx';
import FeedArea from '../shared/FeedArea/FeedArea.tsx';
import { useBubbleState } from './useBubbleState.tsx';
import { setupBubbleEventHandlers } from './BubbleEventHandlers.ts';
import { CategoryProbabilities } from '../shared/FilterControls/types.ts';

interface BubbleViewProps {
  onContentSelect?: (contentId: string) => void;
}

const BubbleView: React.FC<BubbleViewProps> = ({ onContentSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFeedArea, setShowFeedArea] = useState<boolean>(false);
  
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

  // Toggle für den Feed-Bereich
  const toggleFeedArea = () => {
    setShowFeedArea(prev => !prev);
  };

  return (
    <div className="bubble-view" ref={containerRef}>
      {/* Feed-Bereich mit Resize-Funktion */}
      <FeedArea 
        isVisible={showFeedArea} 
        defaultWidth={400}
        minWidth={250}
        maxWidth={600}
      />
      
      <div className={`bubble-container ${showFeedArea ? 'shifted-content' : ''}`}>
        <BubbleCanvas
          contents={contents}
          zoom={zoom}
          rotation={rotation}
          isDragging={isDragging}
          onContentSelect={onContentSelect}
        />
      </div>
      
      {/* Feed-Button */}
      <button 
        className={`search-feed-button ${showFeedArea ? 'shifted-content' : ''}`}
        onClick={toggleFeedArea}
      >
        {showFeedArea ? 'Hide Feed' : 'Search | Feed'}
      </button>
      
      <div className={`controls-container ${showFeedArea ? 'shifted-content' : ''}`}>
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