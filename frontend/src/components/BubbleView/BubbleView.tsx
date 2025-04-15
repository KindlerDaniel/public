import React, { useEffect, useRef, useState } from 'react';
import BubbleControls from './BubbleControls';
import { BubbleContent } from '../../types';
import { getBubbleCoordinates } from '../../utils/mockData';

interface BubbleViewProps {
  onContentSelect?: (contentId: string) => void;
}

const BubbleView: React.FC<BubbleViewProps> = ({ onContentSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(5);
  const [contents, setContents] = useState<BubbleContent[]>([]);
  const [selectedCategories, setSelectedCategories] = useState({
    beautiful: true,
    funny: false,
    wise: true,
  });
  const [timeInterval, setTimeInterval] = useState<string>('day');

  useEffect(() => {
    // Daten basierend auf den Kategorien und dem Zeitintervall laden
    // Konvertiere die mockData in das BubbleContent-Format
    try {
      const bubbleCoordinates = getBubbleCoordinates();
      const mappedContents: BubbleContent[] = bubbleCoordinates.map(coord => ({
        id: coord.id,
        x: coord.position.x,
        y: coord.position.y,
        z: coord.position.z,
        title: `Content ${coord.id}`, // Dies würde in einer echten Implementierung aus den echten Daten kommen
        type: determineContentType(coord.category) // Hilfsfunction, um den Typ zu bestimmen
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
  }, [selectedCategories, timeInterval]);

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

    // Zeichne den Bubble-Hintergrund
    const drawBubble = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Zeichne einen Kreis für die Bubble
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.45 * zoom;
      
      // Farbverlauf für das Bubble-Design
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.7,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgba(100, 150, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(50, 100, 200, 0.6)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Zeichne Content-Punkte
      contents.forEach(content => {
        const x = centerX + (content.x - 0.5) * radius * 2;
        const y = centerY + (content.y - 0.5) * radius * 2;
        
        // Nur zeichnen, wenn der Punkt innerhalb der Bubble liegt
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        if (distanceFromCenter <= radius) {
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          
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
          
          // Titel anzeigen bei hover (in einem echten Projekt wäre dies ein Event)
          ctx.fillStyle = 'black';
          ctx.font = '12px Arial';
          ctx.fillText(content.title, x + 12, y);
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
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.45 * zoom;
      
      // Überprüfe, ob ein Content geklickt wurde
      contents.forEach(content => {
        const contentX = centerX + (content.x - 0.5) * radius * 2;
        const contentY = centerY + (content.y - 0.5) * radius * 2;
        
        const distance = Math.sqrt(
          Math.pow(contentX - x, 2) + Math.pow(contentY - y, 2)
        );
        
        if (distance <= 8) {
          if (onContentSelect) {
            onContentSelect(content.id);
          }
        }
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [contents, zoom, onContentSelect]);

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const handleReset = () => {
    setZoom(1);
    setSpeed(5);
  };

  const handleCategoryChange = (category: 'beautiful' | 'funny' | 'wise') => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleTimeIntervalChange = (interval: string) => {
    setTimeInterval(interval);
  };

  return (
    <div className="bubble-view">
      <div className="bubble-container">
        <canvas ref={canvasRef} className="bubble-canvas"></canvas>
      </div>
      
      <div className="controls-container">
        <BubbleControls 
          onZoomChange={handleZoomChange}
          onSpeedChange={handleSpeedChange}
          onReset={handleReset}
        />
        
        <div className="category-filters">
          <h3>Kategorien:</h3>
          <div className="filter-options">
            <label>
              <input 
                type="checkbox" 
                checked={selectedCategories.beautiful}
                onChange={() => handleCategoryChange('beautiful')}
              />
              Schön
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedCategories.funny}
                onChange={() => handleCategoryChange('funny')}
              />
              Lustig
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedCategories.wise}
                onChange={() => handleCategoryChange('wise')}
              />
              Klug
            </label>
          </div>
        </div>
        
        <div className="time-filter">
          <h3>Zeitraum:</h3>
          <select 
            value={timeInterval}
            onChange={(e) => handleTimeIntervalChange(e.target.value)}
          >
            <option value="hour">Letzte Stunde</option>
            <option value="day">Heute</option>
            <option value="week">Diese Woche</option>
            <option value="month">Diesen Monat</option>
            <option value="year">Dieses Jahr</option>
            <option value="all">Alle Zeiten</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BubbleView;