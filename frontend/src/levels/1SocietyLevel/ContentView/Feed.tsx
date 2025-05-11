import React, { useState, useEffect, useRef, useCallback } from 'react';
import ContentCard from '../shared/ContentCard.tsx';
import { getFeedContent } from '../../../utils/mockData.js';
import { ContentItem, Filters } from '../../../types.ts';
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
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadedPages, setLoadedPages] = useState<number>(1);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<boolean>(false);

  // Einfache Load-Funktion ohne Race Conditions
  const loadPage = useCallback(async (page: number, reset: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const allItems = getFeedContent(feedType, filters);
      const itemsPerPage = 10;
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = allItems.slice(start, end);
      
      if (reset) {
        setFeedItems(pageItems);
        setLoadedPages(1);
      } else {
        setFeedItems(prev => [...prev, ...pageItems]);
        setLoadedPages(page);
      }
      
      if (end >= allItems.length) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Feeds:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [feedType, filters]);

  // Reset und initiales Laden
  useEffect(() => {
    setHasMore(true);
    loadPage(1, true);
  }, [feedType, filters, loadPage]);

  // Observer Setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading && !loadingRef.current) {
        loadPage(loadedPages + 1);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    });

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadedPages, loadPage]);

  const handleContentSelect = useCallback((contentId: string) => {
    setSelectedContentId(contentId);
    if (onSelectContent) {
      onSelectContent(contentId);
    }
  }, [onSelectContent]);

  return (
    <div className={`feed-container ${compact ? 'compact' : ''}`}>
      <div className="feed-list">
        {feedItems.map((item, index) => (
          <div 
            key={item.id} 
            ref={index === feedItems.length - 1 ? lastItemRef : null}
          >
            <ContentCard 
              content={item}
              selected={item.id === selectedContentId}
              compact={compact}
              onClick={() => handleContentSelect(item.id)}
            />
          </div>
        ))}
        
        {loading && (
          <div className="feed-loading-more">
            <div className="loading-spinner">Lade mehr...</div>
          </div>
        )}
        
        {!hasMore && feedItems.length > 0 && (
          <div className="feed-end-message">
            Du hast alle verfügbaren Inhalte gesehen!
          </div>
        )}
        
        {feedItems.length === 0 && !loading && (
          <div className="no-results">Keine Inhalte gefunden</div>
        )}
      </div>
    </div>
  );
};

export default Feed;