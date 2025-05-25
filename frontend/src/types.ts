// frontend/src/types.ts - Erweiterte Content-Typen
export interface ContentItem {
  id: string;
  type: 'video-landscape' | 'video-portrait' | 'image-landscape' | 'image-portrait' | 'text' | 'audio' | 'discussion' | 'article' | 'video' | 'image'; // Erweitert um alte Typen
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    trustScore: number;
  };
  date: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  audioUrl?: string;
  duration?: string; // für Video/Audio
  thumbnail?: string; // Für Rückwärtskompatibilität
  coordinates?: { // Für Bubble-Ansicht
    x: number;
    y: number;
    z: number;
  };
  ratings: {
    beauty: number;
    wisdom: number;
    humor: number;
  };
  userRating?: {
    beauty?: boolean;
    wisdom?: boolean;
    humor?: boolean;
  };
  tags?: string[];
  // Spezielle Felder für Diskussionen
  question?: string;
  discussion?: {
    participantA: string;
    participantB: string;
    exchanges: Array<{
      speaker: 'A' | 'B';
      text: string;
    }>;
  };
  // Zusätzliche Metadaten für Medien
  aspectRatio?: 'landscape' | 'portrait';
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  replies: Comment[];
  ratings: {
    beauty: number;
    wisdom: number;
    humor: number;
  };
  userRating?: {
    beauty?: boolean;
    wisdom?: boolean;
    humor?: boolean;
  };
}

export interface CommentItem {
  id: string;
  contentId: string;
  parentId: string | null;
  text: string;
  author: string;
  timestamp: string;
  ratings: {
    beauty: number;
    wisdom: number;
    humor: number;
  };
  userRating?: {
    beauty?: boolean;
    wisdom?: boolean;
    humor?: boolean;
  };
}

export interface Filters {
  beauty: boolean;
  wisdom: boolean;
  humor: boolean;
  timeRange: string;
}

export interface BubbleContent {
  id: string;
  x: number;
  y: number;
  z?: number;
  title: string;
  type: 'video' | 'photo' | 'audio' | 'text';
}