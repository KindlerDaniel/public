import React, { useState, useEffect } from 'react';
import { ContentItem } from '../../types';
import CommentFeed from './CommentFeed';
import ContentDisplay from '../ContentView/ContentDisplay';
import Feed from '../ContentView/Feed';
import '../../styles/CommentView.css';
import ModeSelector from '../shared/ModeSelector';


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
    // Mock content fetch
    const fetchContent = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        setTimeout(() => {
          const mockContent: ContentItem = {
            id: contentId || '12345',
            type: 'text',
            title: 'Die Zukunft der sozialen Medien: Ein neuer Ansatz',
            content: 'In der sich ständig weiterentwickelnden Landschaft der sozialen Medien sehen wir einen neuen Trend: Plattformen, die nicht auf persönliche Daten, sondern auf hochwertige Inhalte setzen. Dieser Ansatz priorisiert Qualität über Quantität und fördert tiefgründige Gespräche anstelle von oberflächlichen Interaktionen.\n\nDurch die Implementierung eines Vertrauenssystems können Nutzer sicherstellen, dass der Inhalt, den sie sehen, von vertrauenswürdigen Quellen stammt. Dies führt zu einer gesünderen Online-Umgebung, in der Fehlinformationen weniger leicht verbreitet werden können.\n\nWas meint ihr zu diesem Ansatz?',
            author: {
              id: '1', // Eine eindeutige ID
              name: 'ContentCreator', // Der Name des Autors
              trustScore: 75 // Ein Trust-Score-Wert
            },
            date: '2025-04-05T14:30:00',
            ratings: { beauty: 45, wisdom: 78, humor: 12 }
          };
          
          setContent(mockContent);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching content:', error);
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