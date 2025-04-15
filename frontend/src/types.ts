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