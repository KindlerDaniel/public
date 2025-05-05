import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const [feedWidth, setFeedWidth] = useState<number>(0);
  const bubbleContainerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [
    { zoom, rotation, isDragging, lastMousePos, contents, selectedTimeRange },
    { setZoom, setRotation, setIsDragging, setLastMousePos, setCategoryProbabilities, setSelectedTimeRange }
  ] = useBubbleState();

  // Handle feed width changes with debounce to prevent too many updates
  const handleFeedWidthChange = useCallback((width: number) => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      setFeedWidth(width);
      
      // Force canvas redraw after width change
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }, 10);
  }, []);

  // Set up event handlers for the bubble
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
    
    return () => {
      cleanup();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
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

  // Handler for probability changes
  const handleProbabilityChange = (probabilities: CategoryProbabilities) => {
    setCategoryProbabilities(probabilities);
  };

  // Handler for time changes
  const handleTimeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
  };

  // Funktion zum Öffnen der FeedArea
  const openFeedArea = () => {
    setShowFeedArea(true);
  };

  // Funktion zum Schließen der FeedArea
  const closeFeedArea = () => {
    setShowFeedArea(false);
  };

  return (
    <div className="bubble-view" ref={containerRef}>
      {/* Feed area mit Schließen-Funktion */}
      <FeedArea 
        isVisible={showFeedArea} 
        defaultWidth={400}
        minWidth={250}
        maxWidth={600}
        onWidthChange={handleFeedWidthChange}
        onClose={closeFeedArea} // Neue Prop zum Schließen
      />
      
      <div 
        className="bubble-container" 
        ref={bubbleContainerRef}
        style={{ 
          marginLeft: feedWidth + 'px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Ensure vertical centering
          height: '100vh' // Full viewport height
        }}
      >
        <BubbleCanvas
          contents={contents}
          zoom={zoom}
          rotation={rotation}
          isDragging={isDragging}
          onContentSelect={onContentSelect}
          feedAreaWidth={feedWidth}
          feedAreaVisible={showFeedArea}
        />
      </div>
      
      {/* Button nur zum Öffnen des Feeds */}
      <button 
        className="search-feed-button"
        onClick={openFeedArea}
        style={{ 
          marginLeft: feedWidth + 'px',
          display: showFeedArea ? 'none' : 'block' // Ausblenden, wenn Feed geöffnet ist
        }}
      >
        Search | Feed
      </button>
      
      <div 
        className="controls-container" 
        style={{ right: '20px' }}
      >
        {/* Filter controls */}
        <FilterControls
          onProbabilityChange={handleProbabilityChange}
        />
        
        {/* Time selector */}
        <TimeSelector 
          selectedTime={selectedTimeRange}
          onTimeChange={handleTimeChange}
        />
      </div>
    </div>
  );
};

export default BubbleView;