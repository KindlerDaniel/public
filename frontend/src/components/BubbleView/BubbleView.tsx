import React, { useEffect, useRef, useState } from 'react';
import { BubbleContent } from '../../types';
import { getBubbleCoordinates } from '../../utils/mockData';
import CategoryFilterButtons, { CategoryFilters } from '../shared/FilterControls.tsx';

interface BubbleViewProps {
  onContentSelect?: (contentId: string) => void;
}

const BubbleView: React.FC<BubbleViewProps> = ({ onContentSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contents, setContents] = useState<BubbleContent[]>([]);
  
  // Neues Filterkonzept
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters>({
    beauty: { positive: false, negative: false },
    humor: { positive: false, negative: false },
    wisdom: { positive: false, negative: false }
  });

  useEffect(() => {
    // Daten basierend auf den Kategorien laden
    try {
      const bubbleCoordinates = getBubbleCoordinates();
      
      // Filtere Inhalte basierend auf Kategoriefiltern
      const filteredCoordinates = bubbleCoordinates.filter(coord => {
        // Wenn keine Filter aktiv sind, zeige alle Inhalte
        if (!categoryFilters.beauty.positive && !categoryFilters.wisdom.positive && 
            !categoryFilters.humor.positive && !categoryFilters.beauty.negative && 
            !categoryFilters.wisdom.negative && !categoryFilters.humor.negative) {
          return true;
        }
        
        // Positive Filter
        if (categoryFilters.beauty.positive && coord.category === 'beauty') return true;
        if (categoryFilters.wisdom.positive && coord.category === 'wisdom') return true;
        if (categoryFilters.humor.positive && coord.category === 'humor') return true;
        
        // Negative Filter (exkludieren bestimmte Kategorien)
        if (categoryFilters.beauty.negative && coord.category !== 'beauty') return true;
        if (categoryFilters.wisdom.negative && coord.category !== 'wisdom') return true;
        if (categoryFilters.humor.negative && coord.category !== 'humor') return true;
        
        return false;
      });
      
      const mappedContents: BubbleContent[] = filteredCoordinates.map(coord => ({
        id: coord.id,
        x: coord.position.x,
        y: coord.position.y,
        z: coord.position.z,
        title: `Content ${coord.id}`, // In einer echten Implementierung aus tatsächlichen Daten
        type: determineContentType(coord.category)
      }));
      
      setContents(mappedContents);
    } catch (error) {
      console.error('Fehler beim Laden der Bubble-Daten:', error);
      // Fallback zu Mock-Daten
      const mockContents: BubbleContent[] = [
        { id: '1', x: 0.3, y: 0.2, title: 'Content 1', type: 'video' },
        { id: '2', x: 0.7, y: 0.5, title: 'Content 2', type: 'photo' },
        { id: '3', x: 0.4, y: 0.8, title: 'Content 3', type: 'text' },
        { id: '4', x: 0.2, y: 0.6, title: 'Content 4', type: 'audio' },
      ];
      setContents(mockContents);
    }
  }, [categoryFilters]);

  // Hilfsfunction, um den Typ basierend auf der Kategorie zu bestimmen
  const determineContentType = (category: string): 'video' | 'photo' | 'audio' | 'text' => {
    switch (category) {
      case 'beauty':
        return 'photo';
      case 'wisdom':
        return 'text';
      case 'humor':
        return 'video';
      default:
        return 'text';
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
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
        setRotation(prev => ({
          x: prev.x - dy * 0.005, // Vorzeichen umgekehrt
          y: prev.y - dx * 0.005  // Vorzeichen umgekehrt
        }));
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

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
      gradient.addColorStop(0, 'rgba(120, 170, 255, 1.0)');
      gradient.addColorStop(0.7, 'rgba(80, 130, 230, 1.0)');
      gradient.addColorStop(1, 'rgba(50, 100, 200, 1.0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sortiere Content-Punkte nach Z-Tiefe für korrekte Überlappung
      const sortedContents = [...contents].sort((a, b) => {
        const za = a.z || 0;
        const zb = b.z || 0;
        
        // Berechne Z-Werte nach 3D-Transformation
        const rx = rotation.x;
        const ry = rotation.y;
        
        // Zu 3D-Koordinaten
        const ax = (a.x - 0.5) * 2;
        const ay = (a.y - 0.5) * 2;
        const az = (za - 0.5) * 2;
        
        const bx = (b.x - 0.5) * 2;
        const by = (b.y - 0.5) * 2;
        const bz = (zb - 0.5) * 2;
        
        // Rotiere A
        const az1 = az * Math.cos(ry) - ax * Math.sin(ry);
        const az2 = ay * Math.sin(rx) + az1 * Math.cos(rx);
        
        // Rotiere B
        const bz1 = bz * Math.cos(ry) - bx * Math.sin(ry);
        const bz2 = by * Math.sin(rx) + bz1 * Math.cos(rx);
        
        // Sortieren von hinten nach vorne
        return az2 - bz2;
      });

      // Apply 3D rotation effect
      const transform3D = (x: number, y: number, z: number) => {
        // Simple 3D rotation
        const rx = rotation.x;
        const ry = rotation.y;
        
        // Rotate around Y axis
        const cosa = Math.cos(ry);
        const sina = Math.sin(ry);
        const y1 = y;
        const z1 = z * cosa - x * sina;
        const x1 = z * sina + x * cosa;
        
        // Rotate around X axis
        const cosb = Math.cos(rx);
        const sinb = Math.sin(rx);
        const y2 = y1 * cosb - z1 * sinb;
        const z2 = y1 * sinb + z1 * cosb;
        const x2 = x1;
        
        // Calculate 2D position with perspective
        const scale = 400 / (400 + z2);
        const x2d = centerX + x2 * radius * scale;
        const y2d = centerY + y2 * radius * scale;
        
        // Liefere auch Z-Wert zurück für Sichtbarkeitsprüfung
        return { x: x2d, y: y2d, scale, z: z2 };
      };
      
      // Zeichne Content-Punkte mit 3D-Effekt
      sortedContents.forEach(content => {
        // Convert from [0,1] space to [-1,1] space
        const x = (content.x - 0.5) * 2;
        const y = (content.y - 0.5) * 2;
        const z = content.z ? (content.z - 0.5) * 2 : 0;
        
        const transformed = transform3D(x, y, z);
        
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
          switch (content.type) {
            case 'video':
              ctx.fillStyle = 'rgb(255, 100, 100)';
              break;
            case 'photo':
              ctx.fillStyle = 'rgb(100, 255, 100)';
              break;
            case 'audio':
              ctx.fillStyle = 'rgb(255, 255, 100)';
              break;
            case 'text':
              ctx.fillStyle = 'rgb(100, 100, 255)';
              break;
          }
          
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

    // Event-Listener für Klicks
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - canvas.height * 0.1; // Verschiebung nach oben
      const radius = Math.min(canvas.width, canvas.height) * 0.45 * zoom;
      
      // Content detection with 3D rotation
      contents.forEach(content => {
        // Convert from [0,1] space to [-1,1] space
        const cx = (content.x - 0.5) * 2;
        const cy = (content.y - 0.5) * 2;
        const cz = content.z ? (content.z - 0.5) * 2 : 0;
        
        // Apply 3D transformations
        const rx = rotation.x;
        const ry = rotation.y;
        
        // Rotate around Y axis
        const cosa = Math.cos(ry);
        const sina = Math.sin(ry);
        const y1 = cy;
        const z1 = cz * cosa - cx * sina;
        const x1 = cz * sina + cx * cosa;
        
        // Rotate around X axis
        const cosb = Math.cos(rx);
        const sinb = Math.sin(rx);
        const y2 = y1 * cosb - z1 * sinb;
        const z2 = y1 * sinb + z1 * cosb;
        const x2 = x1;
        
        // Calculate 2D position with perspective
        const scale = 400 / (400 + z2);
        const x2d = centerX + x2 * radius * scale;
        const y2d = centerY + y2 * radius * scale;
        
        // Scale hit detection with perspective
        const hitSize = 12 * scale;
        
        const distance = Math.sqrt(
          Math.pow(x2d - x, 2) + Math.pow(y2d - y, 2)
        );
        
        if (distance <= hitSize && z2 > 0) { // Nur klickbar, wenn auf der Vorderseite
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

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [contents, zoom, rotation, isDragging, lastMousePos, onContentSelect]);

  // Handler für Kategorie-Änderungen
  const handleCategoryChange = (category: string, isPositive: boolean) => {
    setCategoryFilters(prev => {
      const categoryKey = category as keyof CategoryFilters;
      const currentValue = isPositive ? prev[categoryKey].positive : prev[categoryKey].negative;
      
      return {
        ...prev,
        [category]: {
          ...prev[categoryKey],
          [isPositive ? 'positive' : 'negative']: !currentValue
        }
      };
    });
  };

  return (
    <div className="bubble-view" ref={containerRef}>
      <div className="bubble-container">
        <canvas 
          ref={canvasRef} 
          className="bubble-canvas"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        ></canvas>
      </div>
      
      {/* Neue Filterkomponente */}
      <CategoryFilterButtons
        categories={categoryFilters}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
};

export default BubbleView;