// Beispiel für die Integration in Ihre bestehende Feed-Komponente
// frontend/src/levels/1SocietyLevel/ContentView/Feed.tsx

import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../shared/ContentCard.tsx';
import { ContentItem } from '../../../types.ts';
import { getFeedContent } from '../../../utils/mockData.js';
import './Feed.css';

// Lokale Definition der Filters-Schnittstelle, die in types.ts fehlt
interface Filters {
  beauty: boolean;
  wisdom: boolean;
  humor: boolean;
  timeRange: string;
}

interface FeedProps {
  compact?: boolean;
  onSelectContent?: (contentId: string) => void;
  filters?: Filters;
  feedType?: string;
  customContents?: ContentItem[];
}

const Feed: React.FC<FeedProps> = ({ 
  compact = false, 
  onSelectContent,
  filters = { beauty: false, wisdom: false, humor: false, timeRange: 'all' },
  feedType = 'trending',
  customContents
}) => {
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);

  // Lade verschiedene Content-Typen
  useEffect(() => {
    // Wenn customContents vorhanden sind, verwende diese direkt
    if (customContents) {
      setFeedItems(customContents);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Verwende die getFeedContent Funktion mit den neuen Content-Typen
      const allItems = getFeedContent(feedType, filters);
      
      // Konvertiere das Format zu ContentItem[] mit erforderlichen Eigenschaften
      const adaptedItems = allItems.map((item: any) => ({
        ...item,
        // Konvertiere id zu number wenn es ein string ist
        id: typeof item.id === 'string' ? parseInt(item.id, 10) || 0 : item.id,
        // Füge fehlende erforderliche Eigenschaften hinzu
        authorId: item.authorId || (item.author?.id ? parseInt(item.author.id, 10) : 0),
        createdAt: item.createdAt || item.date,
        updatedAt: item.updatedAt || item.date
      })) as ContentItem[];
      
      // Setze adaptierte Items
      setFeedItems(adaptedItems);
    } catch (error) {
      console.error('Fehler beim Laden des Feeds:', error);
      setFeedItems([]);
    } finally {
      setLoading(false);
    }
  }, [feedType, filters, customContents]);

  const handleContentSelect = useCallback((contentId: number) => {
    setSelectedContentId(contentId);
    if (onSelectContent) {
      onSelectContent(contentId.toString());
    }
  }, [onSelectContent]);

  if (loading) {
    return (
      <div className="feed-container">
        <div className="feed-loading">Lade Inhalte...</div>
      </div>
    );
  }

  return (
    <div className={`feed-container ${compact ? 'compact' : ''}`}>
      <div className="feed-list">
        {feedItems.map((item) => (
          <ContentCard 
            key={item.id}
            content={item}
            selected={item.id === selectedContentId}
            compact={compact}
            onClick={() => handleContentSelect(item.id)}
          />
        ))}
        
        {feedItems.length === 0 && (
          <div className="no-results">
            Keine Inhalte für die aktuellen Filter gefunden
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;