// User-Schnittstelle
export interface User {
  id: number;
  username: string;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Content-Typen
export type ContentType = 
  | 'video-landscape' 
  | 'video-portrait' 
  | 'image-landscape' 
  | 'image-portrait' 
  | 'text' 
  | 'audio' 
  | 'discussion';

// Content-Item Schnittstelle
export interface ContentItem {
  id: number;
  type: ContentType;
  title: string;
  content: string;
  authorId: number;
  author?: User;
  date: string;
  thumbnailUrl?: string | null;
  mediaUrl?: string | null;
  audioUrl?: string | null;
  duration?: string | null;
  ratings: {
    beauty: number;
    wisdom: number;
    humor: number;
  };
  tags?: string[] | null;
  question?: string | null;
  discussion?: {
    participantA: string;
    participantB: string;
    exchanges: DiscussionExchange[];
  } | null;
  aspectRatio?: 'landscape' | 'portrait' | null;
  dimensions?: {
    width: number;
    height: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// Diskussions-Austausch
export interface DiscussionExchange {
  speaker: 'A' | 'B';
  text: string;
  timestamp?: string;
}

// ContentRating für Benutzer-Bewertungen
export interface ContentRating {
  id: number;
  contentId: number;
  userId: number;
  beauty: boolean | null;
  wisdom: boolean | null;
  humor: boolean | null;
  createdAt: string;
  updatedAt: string;
}

// Formular-Daten für Content-Erstellung/Bearbeitung
export interface ContentFormData {
  type: ContentType;
  title: string;
  content: string;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  audioUrl?: string | null;
  duration?: string | null;
  tags?: string[] | null;
  question?: string | null;
  discussion?: {
    participantA: string;
    participantB: string;
    exchanges: DiscussionExchange[];
  } | null;
  aspectRatio?: 'landscape' | 'portrait' | null;
}