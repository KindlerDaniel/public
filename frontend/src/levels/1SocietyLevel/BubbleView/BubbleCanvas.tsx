import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BubbleContent } from '../../../types.ts';
import { sortContentsByDepth, transform3D, getContentTypeColor } from './BubbleUtils.ts';

interface BubbleCanvasProps {
  contents: BubbleContent[];
  zoom: number;
  rotation: { x: number; y: number };
  isDragging: boolean;
  onContentSelect?: (contentId: string) => void;
  feedAreaWidth?: number;
  feedAreaVisible?: boolean;
}

const BubbleCanvas: React.FC<BubbleCanvasProps> = ({
  contents,
  zoom,
  rotation,
  isDragging,
  onContentSelect,
  feedAreaWidth = 0,
  feedAreaVisible = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setCanvasSize] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced resize handler to prevent too many resize events
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      
      // Set canvas size with a small delay to prevent layout thrashing
      canvas.width = width;
      canvas.height = height;
      
      setCanvasSize({ width, height });
    }, 50); // 50ms debounce
  }, []);

  // Draw function that will be called in the animation frame
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the dimensions for a perfectly round bubble
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Make sure the bubble is always a circle by using the minimum dimension for the radius
    const bubbleSize = Math.min(canvas.width, canvas.height) * 0.45;
    const radius = bubbleSize * zoom;
    
    // Create a gradient for the bubble background
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, 'rgb(114, 166, 255)');
    gradient.addColorStop(0.7, 'rgb(129, 25, 124)');
    gradient.addColorStop(1, 'rgb(0, 23, 68)');
    
    // Draw the circular bubble
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Sort content points by z-depth for correct overlap
    const sortedContents = sortContentsByDepth(contents, rotation);

    // Draw content points with 3D effect
    sortedContents.forEach(content => {
      const point3D = {
        x: content.x,
        y: content.y,
        z: content.z || 0
      };
      
      // Transform 3D point to 2D with updated center coordinates
      const transformed = transform3D(point3D, rotation, centerX, centerY, radius);
      
      // Only draw if point is on the front side and within the bubble
      const distanceFromCenter = Math.sqrt(
        Math.pow(transformed.x - centerX, 2) + Math.pow(transformed.y - centerY, 2)
      );
      
      if (distanceFromCenter <= radius && transformed.z > 0) {
        // Scale point size with perspective
        const pointSize = 8 * transformed.scale;
        
        ctx.beginPath();
        ctx.arc(transformed.x, transformed.y, pointSize, 0, Math.PI * 2);
        
        // Color based on content type
        ctx.fillStyle = getContentTypeColor(content.type);
        ctx.fill();
        
        // Scale text size with perspective
        const fontSize = Math.max(10, 12 * transformed.scale);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        
        // Only show title if point is close enough
        if (transformed.scale > 0.7) {
          // Add text shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 3;
          ctx.fillText(content.title, transformed.x + pointSize + 2, transformed.y + 5);
          ctx.shadowBlur = 0;
        }
      }
    });
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  }, [contents, zoom, rotation]);

  // Handle canvas resizing with ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initial resize
    handleResize();
    
    // Set up a single ResizeObserver for the container
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(drawCanvas);
    
    // Also listen to window resize
    window.addEventListener('resize', handleResize);
    
    return () => {
      // Clean up
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize, drawCanvas]);

  // Re-render on feed area width changes
  useEffect(() => {
    handleResize();
  }, [feedAreaWidth, feedAreaVisible, handleResize]);

  return (
    <canvas 
      ref={canvasRef} 
      className="bubble-canvas"
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    ></canvas>
  );
};

export default BubbleCanvas;