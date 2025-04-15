import React, { useState, useEffect } from 'react';
import { ContentItem } from '../../types';
import CommentFeed from './CommentFeed';
import ContentDisplay from '../ContentView/ContentDisplay';
import Feed from '../ContentView/Feed';
import ModeSelector from '../shared/ModeSelector';
import { getContentById } from '../../utils/mockData';

interface CommentViewProps {
  contentId?: string;
  onSwitchToContentView?: () => void;
}

const CommentView: React.FC<CommentViewProps> = ({ contentId, onSwitchToContentView }) => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [showFeed, setShowFeed] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentHistory, setCommentHistory] = useState<string[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<string>('society');

  useEffect(() => {
    // Lade den Inhalt basierend auf contentId
    if (!contentId) {
      setContent(null);
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      try {
        // Versuche, echte Daten aus der mockData zu laden
        const contentData = getContentById(contentId);
        if (contentData) {
          setContent(contentData);
        } else {
          // Fallback zu Mock-Daten, wenn kein Inhalt gefunden wurde
          setContent({
            id: contentId,
            type: 'text',
            title: 'Die Zukunft der sozialen Medien: Ein neuer Ansatz',
            content: 'In der sich ständig weiterentwickelnden Landschaft der sozialen Medien sehen wir einen neuen Trend: Plattformen, die nicht auf persönliche Daten, sondern auf hochwertige Inhalte setzen.',
            author: {
              id: '1',
              name: 'ContentCreator',
              trustScore: 75
            },
            date: '2025-04-05T14:30:00',
            ratings: { beauty: 45, wisdom: 78, humor: 12 }
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden des Inhalts:', error);
        // Fallback zu Mock-Daten im Fehlerfall
        setContent({
          id: contentId,
          type: 'text',
          title: 'Die Zukunft der sozialen Medien: Ein neuer Ansatz',
          content: 'In der sich ständig weiterentwickelnden Landschaft der sozialen Medien sehen wir einen neuen Trend: Plattformen, die nicht auf persönliche Daten, sondern auf hochwertige Inhalte setzen.',
          author: {
            id: '1',
            name: 'ContentCreator',
            trustScore: 75
          },
          date: '2025-04-05T14:30:00',
          ratings: { beauty: 45, wisdom: 78, humor: 12 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  const handleToggleFeed = () => {
    setShowFeed(!showFeed);
  };

  const handleNavigateHistory = (index: number) => {
    const historyCopy = [...commentHistory];
    const threadId = historyCopy[index];
    
    // Truncate history to this point
    setCommentHistory(historyCopy.slice(0, index + 1));
    setCurrentThreadId(threadId);
  };
  
  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
  };

  const handleAddToHistory = (threadId: string) => {
    setCommentHistory(prev => [...prev, threadId]);
    setCurrentThreadId(threadId);
  };

  const renderCommentGraph = () => {
    return (
      <div className="comment-graph">
        <h3>Kommentar-Navigation</h3>
        <div className="comment-history">
          {commentHistory.map((threadId, index) => (
            <div 
              key={`${threadId}-${index}`}
              className={`history-node ${currentThreadId === threadId ? 'active' : ''}`}
              onClick={() => handleNavigateHistory(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <p className="graph-help">Klicke auf einen Knoten, um in der Kommentarhistorie zu navigieren</p>
      </div>
    );
  };

  return (
    <div className="comment-view">
      <ModeSelector 
        currentMode={currentMode} 
        onModeChange={handleModeChange} 
      />
      
      <div className="comment-view-content">
        {/* Left side - Content and Feed */}
        <div className="comment-view-left">
          {loading ? (
            <div className="loading">Inhalt wird geladen...</div>
          ) : content ? (
            <>
              <div className="content-preview">
                <ContentDisplay content={content} compact />
              </div>
              
              <div className="feed-toggle">
                <button onClick={handleToggleFeed}>
                  {showFeed ? 'Feed ausblenden' : 'Feed anzeigen'}
                </button>
              </div>
              
              {showFeed && (
                <div className="related-feed">
                  <Feed compact limit={5} />
                </div>
              )}
            </>
          ) : (
            <div className="error">Inhalt konnte nicht geladen werden</div>
          )}
        </div>
        
        {/* Center - Comments */}
        <div className="comment-view-center">
          <CommentFeed 
            contentId={content?.id} 
            standalone={true}
            maxHeight="calc(100vh - 180px)"
          />
        </div>
        
        {/* Right - Comment Graph */}
        <div className="comment-view-right">
          {renderCommentGraph()}
        </div>
      </div>
    </div>
  );
};

export default CommentView;