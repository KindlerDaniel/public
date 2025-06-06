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

  // Handler for content selection from feed
  const handleFeedContentSelect = (contentId: string) => {
    // Close the feed when a content is selected
    setShowFeedArea(false);
    
    // Call the parent's content select handler
    if (onContentSelect) {
      onContentSelect(contentId);
    }
  };

  return (
    <div className="bubble-view" ref={containerRef}>
      {/* Feed area */}
      <FeedArea 
        isVisible={showFeedArea} 
        defaultWidth={500} // Erhöht von 400 auf 500
        minWidth={250}
        maxWidth={700} // Erhöht von 600 auf 700
        onWidthChange={handleFeedWidthChange}
        onClose={closeFeedArea}
        onContentSelect={handleFeedContentSelect}
      />
      
      {/* Main bubble container - always centered */}
      <div 
        className="bubble-main-container" 
        ref={bubbleContainerRef}
        style={{
          position: 'fixed',
          left: `${50 + feedWidth}px`, // Sidebar width + feed width
          top: '0',
          right: '0',
          bottom: '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
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
      
      <button 
        className="search-feed-button"
        onClick={openFeedArea}
        style={{ 
          display: showFeedArea ? 'none' : 'block'
        }}
      >
        Search | Feed
      </button>
      
      <div 
        className="controls-container" 
        style={{ right: '20px' }}
      >
        <FilterControls
          onProbabilityChange={handleProbabilityChange}
        />
        
        <TimeSelector 
          selectedTime={selectedTimeRange}
          onTimeChange={handleTimeChange}
        />
      </div>
    </div>
  );
};

export default BubbleView;