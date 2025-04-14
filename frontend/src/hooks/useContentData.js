import { useState, useEffect, useCallback } from 'react';
import { fetchMockContent } from '../utils/mockData';

/**
 * Hook zum Laden und Verwalten von Content-Daten
 * 
 * @param {Object} options - Optionen für das Abrufen von Inhalten
 * @param {string} options.contentId - Optional: ID eines spezifischen Inhalts
 * @param {string} options.feedType - Optional: Art des Feeds (trending, latest, related, etc.)
 * @param {number} options.limit - Optional: Maximale Anzahl der zu ladenden Inhalte
 * @param {Object} options.filters - Optional: Filter für Inhalte (beauty, wisdom, humor, timeRange)
 * @returns {Object} - Content-Daten und Funktionen zum Verwalten
 */
const useContentData = ({ 
  contentId = null, 
  feedType = 'trending', 
  limit = 10,
  filters = { beauty: false, wisdom: false, humor: false, timeRange: 'all' }
} = {}) => {
  const [content, setContent] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Funktion zum Laden eines einzelnen Inhalts
  const loadContent = useCallback(async (id) => {
    setLoading(true);
    try {
      // In einer echten Implementierung würde hier ein API-Aufruf erfolgen
      const contentData = await fetchMockContent(id);
      setContent(contentData);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden des Inhalts:', err);
      setError('Der Inhalt konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Funktion zum Laden von Feed-Elementen
  const loadFeed = useCallback(async (refresh = false) => {
    if (refresh) {
      setPage(1);
      setFeedItems([]);
    }

    setLoading(true);
    try {
      // In einer echten Implementierung würde hier ein API-Aufruf erfolgen
      // mit Pagination, Filtern, etc.
      const newPage = refresh ? 1 : page;
      
      // Simuliere API-Verzögerung
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generiere Mock-Daten basierend auf Filtern und feedType
      const newItems = Array(limit).fill(0).map((_, index) => {
        const mockContent = fetchMockContent(`${feedType}-${newPage}-${index}`);
        
        // Passe Bewertungen basierend auf Filtern an
        if (filters.beauty) {
          mockContent.ratings.beauty = Math.max(20, mockContent.ratings.beauty);
        }
        if (filters.wisdom) {
          mockContent.ratings.wisdom = Math.max(20, mockContent.ratings.wisdom);
        }
        if (filters.humor) {
          mockContent.ratings.humor = Math.max(20, mockContent.ratings.humor);
        }
        
        return mockContent;
      });
      
      setFeedItems(prev => refresh ? newItems : [...prev, ...newItems]);
      setHasMore(newPage < 3); // Simuliere ein Ende nach 3 Seiten
      setPage(newPage + 1);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden des Feeds:', err);
      setError('Der Feed konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [feedType, filters, limit, page]);

  // Funktion zum Bewerten eines Inhalts
  const rateContent = useCallback(async (id, type, value) => {
    try {
      // In einer echten Implementierung würde hier ein API-Aufruf erfolgen
      console.log(`Rating content ${id}: ${type} = ${value}`);
      
      // Aktualisiere den Hauptinhalt, falls er bewertet wird
      if (content && content.id === id) {
        setContent(prev => {
          const currentRating = prev.userRating?.[type] || false;
          const ratingDiff = currentRating === value ? 0 : (value ? 1 : -1);
          
          return {
            ...prev,
            userRating: {
              ...prev.userRating,
              [type]: value
            },
            ratings: {
              ...prev.ratings,
              [type]: prev.ratings[type] + ratingDiff
            }
          };
        });
      }
      
      // Aktualisiere auch den Feed, falls ein Element daraus bewertet wird
      setFeedItems(prev => 
        prev.map(item => {
          if (item.id === id) {
            const currentRating = item.userRating?.[type] || false;
            const ratingDiff = currentRating === value ? 0 : (value ? 1 : -1);
            
            return {
              ...item,
              userRating: {
                ...item.userRating,
                [type]: value
              },
              ratings: {
                ...item.ratings,
                [type]: item.ratings[type] + ratingDiff
              }
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Fehler beim Bewerten des Inhalts:', err);
      // Man könnte hier einen Toast oder eine Benachrichtigung anzeigen
    }
  }, [content]);

  // Lade Inhalt, wenn contentId übergeben wird
  useEffect(() => {
    if (contentId) {
      loadContent(contentId);
    }
  }, [contentId, loadContent]);

  // Lade Feed beim ersten Rendern und wenn sich Filter oder feedType ändern
  useEffect(() => {
    loadFeed(true);
  }, [feedType, JSON.stringify(filters), loadFeed]);

  return {
    content,
    feedItems,
    loading,
    error,
    hasMore,
    loadMore: () => loadFeed(false),
    refreshFeed: () => loadFeed(true),
    rateContent
  };
};

export default useContentData;