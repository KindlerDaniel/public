import React, { useState, useEffect } from 'react';
import ContentCard from '../shared/ContentCard';
import { getFeedContent } from '../../utils/mockData';
import { ContentItem, Filters } from '../../types';
import '../../styles/Feed.css';

interface FeedProps {
  compact?: boolean;
  limit?: number;
  onSelectContent?: (contentId: string) => void;
  filters?: Filters;
}

const Feed: React.FC<FeedProps> = ({ 
  compact = false, 
  limit = 10,
  onSelectContent,
  filters = { beauty: false, wisdom: false, humor: false, timeRange: 'all' }
}) => {
  const [feedType, setFeedType] = useState<string>('trending');
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  // Lade Feed-Inhalte
  useEffect(() => {
    setLoading(true);
    
    // Lade Mock-Daten
    try {
      const items = getFeedContent(feedType, filters);
      setFeedItems(items.slice(0, limit));
    } catch (error) {
      console.error('Fehler beim Laden des Feeds:', error);
    } finally {
      setLoading(false);
    }
  }, [feedType, limit, filters]);

  // Handler für Tab-Wechsel
  const handleTabChange = (type: string) => {
    setFeedType(type);
  };

  // Handler für Content-Auswahl
  const handleContentSelect = (contentId: string) => {
    setSelectedContentId(contentId);
    if (onSelectContent) {
      onSelectContent(contentId);
    }
  };

  return (
    <div className={`feed-container ${compact ? 'compact' : ''}`}>
      <div className="feed-tabs">
        <div 
          className={`feed-tab ${feedType === 'trending' ? 'active' : ''}`}
          onClick={() => handleTabChange('trending')}
        >
          Trending
        </div>
        <div 
          className={`feed-tab ${feedType === 'newest' ? 'active' : ''}`}
          onClick={() => handleTabChange('newest')}
        >
          Neueste
        </div>
        <div 
          className={`feed-tab ${feedType === 'beauty' ? 'active' : ''}`}
          onClick={() => handleTabChange('beauty')}
        >
          Schön
        </div>
        <div 
          className={`feed-tab ${feedType === 'wisdom' ? 'active' : ''}`}
          onClick={() => handleTabChange('wisdom')}
        >
          Weise
        </div>
        <div 
          className={`feed-tab ${feedType === 'humor' ? 'active' : ''}`}
          onClick={() => handleTabChange('humor')}
        >
          Lustig
        </div>
      </div>
      
      <div className="feed-list">
        {loading ? (
          <div className="loading-indicator">Lade Inhalte...</div>
        ) : feedItems.length > 0 ? (
          feedItems.map(item => (
            <ContentCard 
              key={item.id}
              content={item}
              selected={item.id === selectedContentId}
              compact={compact}
              onClick={() => handleContentSelect(item.id)}
            />
          ))
        ) : (
          <div className="no-results">Keine Inhalte gefunden</div>
        )}
      </div>
    </div>
  );
};

export default Feed;