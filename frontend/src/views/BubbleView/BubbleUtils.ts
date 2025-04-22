import { BubbleContent } from '../../types.ts';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
  scale: number;
  z: number; // Für Sichtbarkeitsprüfung
}

export interface Rotation {
  x: number;
  y: number;
}

/**
 * Transformiert 3D-Koordinaten basierend auf einer Rotation
 */
export const transform3D = (
  point: Point3D,
  rotation: Rotation,
  centerX: number,
  centerY: number,
  radius: number
): Point2D => {
  // Konvertiere von [0,1] zu [-1,1]
  const x = (point.x - 0.5) * 2;
  const y = (point.y - 0.5) * 2;
  const z = point.z ? (point.z - 0.5) * 2 : 0;
  
  const rx = rotation.x;
  const ry = rotation.y;
  
  // Rotation um Y-Achse
  const cosa = Math.cos(ry);
  const sina = Math.sin(ry);
  const y1 = y;
  const z1 = z * cosa - x * sina;
  const x1 = z * sina + x * cosa;
  
  // Rotation um X-Achse
  const cosb = Math.cos(rx);
  const sinb = Math.sin(rx);
  const y2 = y1 * cosb - z1 * sinb;
  const z2 = y1 * sinb + z1 * cosb;
  const x2 = x1;
  
  // Berechne 2D-Position mit Perspektive
  const scale = 400 / (400 + z2);
  const x2d = centerX + x2 * radius * scale;
  const y2d = centerY + y2 * radius * scale;
  
  return { x: x2d, y: y2d, scale, z: z2 };
};

/**
 * Bestimmt den Typ des Inhalts basierend auf der Kategorie
 */
export const determineContentType = (category: string): 'video' | 'photo' | 'audio' | 'text' => {
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

/**
 * Sortiert Inhalte nach Z-Tiefe für korrekte Überlappung
 */
export const sortContentsByDepth = (contents: BubbleContent[], rotation: Rotation): BubbleContent[] => {
  return [...contents].sort((a, b) => {
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
};

/**
 * Gibt die Füllfarbe basierend auf dem Content-Typ zurück
 */
export const getContentTypeColor = (type: string): string => {
  switch (type) {
    case 'video':
      return 'rgb(255, 100, 100)';
    case 'photo':
      return 'rgb(100, 255, 100)';
    case 'audio':
      return 'rgb(255, 255, 100)';
    case 'text':
      return 'rgb(100, 100, 255)';
    default:
      return 'rgb(200, 200, 200)';
  }
};