import React, { useState, useRef, useEffect } from 'react';
import './FeedArea.css';
import Feed from '../../ContentView/Feed.tsx';
import FeedTypeSelector, { FeedType } from './FeedTypeSelector.tsx';

interface FeedAreaProps {
  isVisible: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  onClose?: () => void;
  onContentSelect?: (contentId: string) => void;
}

const FeedArea: React.FC<FeedAreaProps> = ({ 
  isVisible, 
  defaultWidth = 400,
  minWidth = 250,
  maxWidth = 600,
  onWidthChange,
  onClose,
  onContentSelect
}) => {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType>('trending');
  const feedAreaRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Update width when visibility changes
  useEffect(() => {
    if (isVisible) {
      // When showing, use saved width
      document.documentElement.style.setProperty('--feed-area-width', `${width}px`);
      if (onWidthChange) {
        onWidthChange(width);
      }
    } else {
      // When hiding, set width to 0
      document.documentElement.style.setProperty('--feed-area-width', '0px');
      if (onWidthChange) {
        onWidthChange(0);
      }
    }
  }, [isVisible, width, onWidthChange]);

  // Effect for drag handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && feedAreaRef.current) {
        const newWidth = e.clientX;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
          document.documentElement.style.setProperty('--feed-area-width', `${newWidth}px`);
          if (onWidthChange) {
            onWidthChange(newWidth);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, onWidthChange]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handler für den Schließen-Button
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Handler für Feed-Typ-Änderungen
  const handleFeedTypeChange = (feedType: FeedType) => {
    setSelectedFeedType(feedType);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="feed-area" 
      ref={feedAreaRef}
      style={{ width: `${width}px` }}
    >
      {/* Header ohne Steuerelemente */}
      <div className="feed-area-header">
        <h3>Feed</h3>
      </div>
      
      {/* Content ohne Feed-Typ-Auswahl */}
      <div className="feed-area-content">
        <Feed 
          compact={true}
          onSelectContent={onContentSelect}
          feedType={selectedFeedType}
        />
      </div>
      
      <div 
        className="resize-handle"
        ref={resizeHandleRef}
        onMouseDown={handleResizeStart}
      >
        <div className="handle-line"></div>
      </div>
      
      {/* Footer mit Feed-Auswahl und Schließen-Button */}
      <div className="feed-area-footer">
        <div className="feed-controls">
          {/* Feed-Typ-Auswahl im Footer */}
          <div className="feed-type-controls-footer">
            <FeedTypeSelector 
              selectedType={selectedFeedType}
              onTypeChange={handleFeedTypeChange}
            />
          </div>
          <button 
            className="feed-area-close-button"
            onClick={handleClose}
            title="Feed schließen"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedArea;