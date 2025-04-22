import { RefObject } from 'react';
import { BubbleContent } from '../../types.ts';
import { transform3D } from './BubbleUtils.ts';

export interface BubbleEventHandlersProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: { x: number; y: number };
  setRotation: (rotation: { x: number; y: number }) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  lastMousePos: { x: number; y: number };
  setLastMousePos: (pos: { x: number; y: number }) => void;
  contents: BubbleContent[];
  onContentSelect?: (contentId: string) => void;
}

export const setupBubbleEventHandlers = ({
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
}: BubbleEventHandlersProps) => {
  if (!canvasRef.current) return () => {};

  const canvas = canvasRef.current;

  // Mouse wheel handler for zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));
    setZoom(newZoom);
  };

  // Mouse drag handlers for rotation
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      
      // Korrigierte Drehrichtung
      setRotation({
        x: rotation.x - dy * 0.005, // Vorzeichen umgekehrt
        y: rotation.y - dx * 0.005  // Vorzeichen umgekehrt
      });
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Event-Listener für Klicks
  const handleCanvasClick = (e: MouseEvent) => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - canvas.height * 0.1; // Verschiebung nach oben
    const radius = Math.min(canvas.width, canvas.height) * 0.45 * zoom;
    
    // Content detection mit 3D-Rotation
    contents.forEach(content => {
      const point3D = {
        x: content.x,
        y: content.y,
        z: content.z || 0
      };
      
      const transformed = transform3D(point3D, rotation, centerX, centerY, radius);
      
      // Skaliere Hit-Detection mit Perspektive
      const hitSize = 12 * transformed.scale;
      
      const distance = Math.sqrt(
        Math.pow(transformed.x - x, 2) + Math.pow(transformed.y - y, 2)
      );
      
      if (distance <= hitSize && transformed.z > 0) { // Nur klickbar, wenn auf der Vorderseite
        if (onContentSelect) {
          onContentSelect(content.id);
        }
      }
    });
  };

  // Add event listeners
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('wheel', handleWheel);
  canvas.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  // Return cleanup function
  return () => {
    canvas.removeEventListener('click', handleCanvasClick);
    canvas.removeEventListener('wheel', handleWheel);
    canvas.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
};