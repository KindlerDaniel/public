export interface ContentItem {
    id: string;
    type: string;
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