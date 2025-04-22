import { useState, useEffect } from 'react';
import { BubbleContent } from '../../types.ts';
import { getBubbleCoordinates } from '../../utils/mockData.js';
import { determineContentType } from './BubbleUtils.ts';
import { CategoryProbabilities } from '../shared/FilterControls/types.ts';
import { TimeRange } from './TimeSelector.tsx';

export interface BubbleState {
  zoom: number;
  rotation: { x: number; y: number };
  isDragging: boolean;
  lastMousePos: { x: number; y: number };
  contents: BubbleContent[];
  selectedTimeRange: TimeRange;
  categoryProbabilities: CategoryProbabilities;
}

export interface BubbleStateActions {
  setZoom: (zoom: number) => void;
  setRotation: (rotation: { x: number; y: number }) => void;
  setIsDragging: (isDragging: boolean) => void;
  setLastMousePos: (pos: { x: number; y: number }) => void;
  setCategoryProbabilities: (probs: CategoryProbabilities) => void;
  setSelectedTimeRange: (timeRange: TimeRange) => void;
}

export const useBubbleState = (): [BubbleState, BubbleStateActions] => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contents, setContents] = useState<BubbleContent[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('all');
  
  // State für die Kategorie-Wahrscheinlichkeiten
  const [categoryProbabilities, setCategoryProbabilities] = useState<CategoryProbabilities>({
    wise: 16.67,
    stupid: 16.67,
    beautiful: 16.67,
    repulsive: 16.67,
    funny: 16.67,
    unfunny: 16.67
  });

  useEffect(() => {
    // Daten basierend auf den Wahrscheinlichkeiten laden
    try {
      const bubbleCoordinates = getBubbleCoordinates();
      
      // Berechnung der relativen Wahrscheinlichkeiten für jede Hauptkategorie
      const categoryWeights = {
        wisdom: categoryProbabilities.wise / (categoryProbabilities.wise + categoryProbabilities.stupid),
        beauty: categoryProbabilities.beautiful / (categoryProbabilities.beautiful + categoryProbabilities.repulsive),
        humor: categoryProbabilities.funny / (categoryProbabilities.funny + categoryProbabilities.unfunny)
      };
      
      // Wahrscheinlichkeitsbasierte Filterung der Koordinaten
      const filteredCoordinates = bubbleCoordinates.filter(coord => {
        // Zufallswert zwischen 0 und 1 generieren
        const rand = Math.random();
        
        // Mit der entsprechenden Kategorie-Wahrscheinlichkeit vergleichen
        switch (coord.category) {
          case 'wisdom':
            return rand <= categoryWeights.wisdom;
          case 'beauty':
            return rand <= categoryWeights.beauty;
          case 'humor':
            return rand <= categoryWeights.humor;
          default:
            return true;
        }
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
        { id: '1', x: 0.3, y: 0.2, z: 0.5, title: 'Content 1', type: 'video' },
        { id: '2', x: 0.7, y: 0.5, z: 0.3, title: 'Content 2', type: 'photo' },
        { id: '3', x: 0.4, y: 0.8, z: 0.7, title: 'Content 3', type: 'text' },
        { id: '4', x: 0.2, y: 0.6, z: 0.4, title: 'Content 4', type: 'audio' },
      ];
      setContents(mockContents);
    }
  }, [categoryProbabilities, selectedTimeRange]);

  return [
    { zoom, rotation, isDragging, lastMousePos, contents, selectedTimeRange, categoryProbabilities },
    { setZoom, setRotation, setIsDragging, setLastMousePos, setCategoryProbabilities, setSelectedTimeRange }
  ];
};