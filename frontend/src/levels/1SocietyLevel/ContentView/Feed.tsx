// Beispiel für die Integration in Ihre bestehende Feed-Komponente
// frontend/src/levels/1SocietyLevel/ContentView/Feed.tsx

import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../shared/ContentCard.tsx';
import { ContentItem, Filters } from '../../../types.ts';
import { getFeedContent } from '../../../utils/mockData.js';
import './Feed.css';

interface FeedProps {
  compact?: boolean;
  onSelectContent?: (contentId: string) => void;
  filters?: Filters;
  feedType?: string;
}

const Feed: React.FC<FeedProps> = ({ 
  compact = false, 
  onSelectContent,
  filters = { beauty: false, wisdom: false, humor: false, timeRange: 'all' },
  feedType = 'trending'
}) => {
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  // Lade verschiedene Content-Typen
  useEffect(() => {
    setLoading(true);
    
    try {
      // Verwende die getFeedContent Funktion mit den neuen Content-Typen
      const allItems = getFeedContent(feedType, filters);
      
      // Type-Assertion für TypeScript-Kompatibilität
      setFeedItems(allItems as ContentItem[]);
    } catch (error) {
      console.error('Fehler beim Laden des Feeds:', error);
      setFeedItems([]);
    } finally {
      setLoading(false);
    }
  }, [feedType, filters]);

  const handleContentSelect = useCallback((contentId: string) => {
    setSelectedContentId(contentId);
    if (onSelectContent) {
      onSelectContent(contentId);
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