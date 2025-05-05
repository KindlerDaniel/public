import React, { useState, useRef, useEffect } from 'react';
import './FeedArea.css';

interface FeedAreaProps {
  isVisible: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const FeedArea: React.FC<FeedAreaProps> = ({ 
  isVisible, 
  defaultWidth = 400,
  minWidth = 250,
  maxWidth = 600
}) => {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const feedAreaRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Effekt zum Aktualisieren der CSS-Variable beim Ändern der Sichtbarkeit
  useEffect(() => {
    if (isVisible) {
      // Sofort beim Einblenden die Standard-Breite setzen
      document.documentElement.style.setProperty('--feed-area-width', `${defaultWidth}px`);
    } else {
      // Beim Ausblenden auf 0 setzen
      document.documentElement.style.setProperty('--feed-area-width', '0px');
    }
  }, [isVisible, defaultWidth]);

  // Effekt für das Drag-Handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && feedAreaRef.current) {
        const newWidth = e.clientX;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
          document.documentElement.style.setProperty('--feed-area-width', `${newWidth}px`);
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
  }, [isDragging, minWidth, maxWidth]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
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
      <div className="feed-area-content">
        {/* Hier werden später die Feed-Inhalte angezeigt */}
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
        <p>Feed-Steuerelemente</p>
      </div>
    </div>
  );
};

export default FeedArea;