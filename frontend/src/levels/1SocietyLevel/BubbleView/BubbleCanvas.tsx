import React, { useRef, useEffect } from 'react';
import { BubbleContent } from '../../../types.ts';
import { sortContentsByDepth, transform3D, getContentTypeColor } from './BubbleUtils.ts';

interface BubbleCanvasProps {
  contents: BubbleContent[];
  zoom: number;
  rotation: { x: number; y: number };
  isDragging: boolean;
  onContentSelect?: (contentId: string) => void;
}

const BubbleCanvas: React.FC<BubbleCanvasProps> = ({
  contents,
  zoom,
  rotation,
  isDragging,
  onContentSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Passe die Canvas-Größe an
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Zeichne den Bubble-Hintergrund
    const drawBubble = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Zeichne einen Kreis für die Bubble
      const centerX = canvas.width / 2 - canvas.width * 0.04; // Verschiebung nach links
      const centerY = canvas.height / 2 - canvas.height * 0.03; // Verschiebung nach oben
      const radius = Math.min(canvas.width, canvas.height) * 0.45 * zoom;
      
      // Farbverlauf für das Bubble-Design - undurchsichtig
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgb(114, 166, 255)');
      gradient.addColorStop(0.7, 'rgb(129, 25, 124)');
      gradient.addColorStop(1, 'rgb(0, 23, 68)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sortiere Content-Punkte nach Z-Tiefe für korrekte Überlappung
      const sortedContents = sortContentsByDepth(contents, rotation);

      // Zeichne Content-Punkte mit 3D-Effekt
      sortedContents.forEach(content => {
        const point3D = {
          x: content.x,
          y: content.y,
          z: content.z || 0
        };
        
        const transformed = transform3D(point3D, rotation, centerX, centerY, radius);
        
        // Überprüfen, ob Punkt auf der Vorderseite (positive Z-Werte)
        // und ob der Punkt innerhalb der Bubble liegt
        const distanceFromCenter = Math.sqrt(
          Math.pow(transformed.x - centerX, 2) + Math.pow(transformed.y - centerY, 2)
        );
        
        // Nur zeichnen, wenn der Punkt innerhalb der Bubble liegt und auf der Vorderseite ist
        if (distanceFromCenter <= radius) {
          // Scale point size with perspective
          const pointSize = 8 * transformed.scale;
          
          ctx.beginPath();
          ctx.arc(transformed.x, transformed.y, pointSize, 0, Math.PI * 2);
          
          // Verschiedene Farben basierend auf dem Content-Typ
          ctx.fillStyle = getContentTypeColor(content.type);
          ctx.fill();
          
          // Scale text size with perspective
          const fontSize = Math.max(10, 12 * transformed.scale);
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = 'black';
          
          // Nur Titel anzeigen, wenn der Punkt nahe genug ist
          if (transformed.scale > 0.7) {
            ctx.fillText(content.title, transformed.x + pointSize + 2, transformed.y + 5);
          }
        }
      });
    };

    // Animation mit requestAnimationFrame
    let animationFrameId: number;
    const animate = () => {
      drawBubble();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [contents, zoom, rotation]);

  return (
    <canvas 
      ref={canvasRef} 
      className="bubble-canvas"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    ></canvas>
  );
};

export default BubbleCanvas;