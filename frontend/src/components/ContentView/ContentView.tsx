import React, { useState, useEffect } from 'react';
import '../../styles/ContentView.css';
import Feed from './Feed';
import ContentDisplay from './ContentDisplay';
import Comments from './Comments';
import FilterControls from '../shared/FilterControls';
import ModeSelector from '../shared/ModeSelector';

interface ContentViewProps {
  contentId?: string;
  onSwitchToBubbleView?: () => void;
  onSwitchToCommentView?: () => void;
}

const ContentView: React.FC<ContentViewProps> = ({ 
  contentId, 
  onSwitchToBubbleView, 
  onSwitchToCommentView 
}) => {
  const [showFeed, setShowFeed] = useState<boolean>(true);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<string>('society');

  const handleToggleFeed = () => {
    setShowFeed(!showFeed);
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
  };

  return (
    <div className="content-view">
      <ModeSelector 
        currentMode={currentMode} 
        onModeChange={handleModeChange} 
      />
      
      <div className="content-view-container">
        {/* Left side - Feed */}
        {showFeed && (
          <div className="content-view-feed">
            <div className="content-view-header">
              <h3>Feed</h3>
              <button 
                className="view-toggle-button" 
                onClick={handleToggleFeed}
              >
                Hide Feed
              </button>
            </div>
            <Feed />
          </div>
        )}
        
        {/* Middle - Content Display */}
        <div className="content-view-main">
          {!showFeed && (
            <button 
              className="view-toggle-button" 
              onClick={handleToggleFeed}
            >
              Show Feed
            </button>
          )}
          
          <div className="filter-controls-container">
            <FilterControls />
          </div>
          
          <ContentDisplay 
            contentId={contentId} 
            onViewComments={handleToggleComments}
            onSwitchToBubbleView={onSwitchToBubbleView}
            onSwitchToCommentView={onSwitchToCommentView}
          />
        </div>
        
        {/* Right side - Comments */}
        {showComments && (
          <div className="content-view-comments">
            <div className="content-view-header">
              <h3>Comments</h3>
              <div className="header-actions">
                <button 
                  className="view-toggle-button" 
                  onClick={handleToggleComments}
                >
                  Hide Comments
                </button>
                
                {onSwitchToCommentView && (
                  <button 
                    className="comment-view-button"
                    onClick={onSwitchToCommentView}
                  >
                    Comment View
                  </button>
                )}
              </div>
            </div>
            <Comments contentId={contentId} />
          </div>
        )}
        
        {!showComments && (
          <button 
            className="view-toggle-button float-right" 
            onClick={handleToggleComments}
          >
            Show Comments
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentView;