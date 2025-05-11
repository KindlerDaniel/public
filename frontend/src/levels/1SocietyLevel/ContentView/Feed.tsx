import React, { useState, useEffect, useRef, useCallback } from 'react';
import ContentCard from '../shared/ContentCard.tsx';
import { getFeedContent } from '../../../utils/mockData.js';
import { ContentItem, Filters } from '../../../types.ts';
import './Feed.css';

interface FeedProps {
  compact?: boolean;
  onSelectContent?: (contentId: string) => void;
  filters?: Filters;
  feedType?: string; // Neue Prop für den Feed-Typ (von Steuerelementen)
}

const Feed: React.FC<FeedProps> = ({ 
  compact = false, 
  onSelectContent,
  filters = { beauty: false, wisdom: false, humor: false, timeRange: 'all' },
  feedType = 'trending' // Standard: trending
}) => {
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  // Lade mehr Items basierend auf der aktuellen Seite
  const loadMoreItems = useCallback(async (currentPage: number) => {
    setLoading(true);
    
    try {
      // Simuliere Latenzeit für den API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Lade Mock-Daten
      const allItems = getFeedContent(feedType, filters);
      const itemsPerPage = 10;
      const startIndex = currentPage * itemsPerPage;
      const endIndex = (currentPage + 1) * itemsPerPage;
      const pageItems = allItems.slice(startIndex, endIndex);
      
      // Keine weiteren Items verfügbar
      if (pageItems.length === 0 || endIndex >= allItems.length) {
        setHasMore(false);
      }
      
      // Aktualisiere State
      if (currentPage === 0) {
        setFeedItems(pageItems);
        setInitialLoading(false);
      } else {
        setFeedItems(prev => [...prev, ...pageItems]);
      }
      
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Fehler beim Laden des Feeds:', error);
    } finally {
      setLoading(false);
    }
  }, [feedType, filters]);

  // Lade initiale Feed-Inhalte
  useEffect(() => {
    setInitialLoading(true);
    setPage(0);
    setFeedItems([]);
    setHasMore(true);
    loadMoreItems(0);
  }, [feedType, filters, loadMoreItems]);

  // Einrichten des Intersection Observers
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMoreItems(page);
        }
      },
      { 
        root: null,
        rootMargin: '100px',
        threshold: 0.1 
      }
    );

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [page, loading, hasMore, loadMoreItems]);

  // Handler für Content-Auswahl
  const handleContentSelect = (contentId: string) => {
    setSelectedContentId(contentId);
    if (onSelectContent) {
      onSelectContent(contentId);
    }
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="feed-loading-skeleton">
      {Array(3).fill(0).map((_, index) => (
        <div key={index} className="content-card skeleton">
          <div className="skeleton-media"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-meta"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-footer"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`feed-container ${compact ? 'compact' : ''}`}>
      {/* Feed-Tabs entfernt - werden jetzt in den Steuerelementen angezeigt */}
      
      <div className="feed-list">
        {initialLoading ? (
          <LoadingSkeleton />
        ) : feedItems.length > 0 ? (
          <>
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
            
            {/* Loading mehr Indikator */}
            {loading && !initialLoading && (
              <div className="feed-loading-more">
                <div className="loading-spinner">Lade mehr...</div>
              </div>
            )}
            
            {/* Ende erreicht Indikator */}
            {!hasMore && (
              <div className="feed-end-message">
                Du hast alle verfügbaren Inhalte gesehen!
              </div>
            )}
          </>
        ) : (
          <div className="no-results">Keine Inhalte gefunden</div>
        )}
      </div>
    </div>
  );
};

export default Feed;