import React, { useState, useRef, useEffect } from 'react';
import './FeedArea.css';

interface FeedAreaProps {
  isVisible: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  onClose?: () => void;
}

const FeedArea: React.FC<FeedAreaProps> = ({ 
  isVisible, 
  defaultWidth = 400,
  minWidth = 250,
  maxWidth = 600,
  onWidthChange,
  onClose
}) => {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);
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

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="feed-area" 
      ref={feedAreaRef}
      style={{ width: `${width}px` }}
    >
      {/* Header ohne Schließen-Button */}
      <div className="feed-area-header">
        <h3>Feed</h3>
      </div>
      
      <div className="feed-area-content">
        {/* Feed content will be here */}
        <p className="feed-placeholder">Feed-Inhalte werden hier angezeigt</p>
      </div>
      
      <div 
        className="resize-handle"
        ref={resizeHandleRef}
        onMouseDown={handleResizeStart}
      >
        <div className="handle-line"></div>
      </div>
      
      <div className="feed-area-footer">
        <div className="feed-controls">
          <p>Feed-Steuerelemente</p>
          {/* Schließen-Button unten rechts */}
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