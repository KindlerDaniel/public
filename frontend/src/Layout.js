import React, { useState } from 'react';
import Sidebar from './levels/Sidebar.tsx';
import { useViewContext, ViewTypes } from './context/ViewContext.js';
import './layout.css';

// Society Level
import BubbleView from './levels/society-level/BubbleView/BubbleView.tsx';
import ContentView from './levels/society-level/ContentView/ContentView.tsx';
import CommentView from './levels/society-level/CommentView/CommentView.tsx';

// Group Level
import GroupLevelView from './levels/group-level/GroupLevelView.js';

// Friend Level (Chat)
import FriendLevelView from './levels/friend-level/FriendLevelView.js';

// Individual Level
import IndividualLevelView from './levels/individual-level/IndividualLevelView.js';

const Layout = () => {
  const [currentLevel, setCurrentLevel] = useState('society');
  const { 
    currentView, 
    contentId, 
    navigateToBubbleView, 
    navigateToContentView, 
    navigateToCommentView 
  } = useViewContext();

  const handleLevelChange = (level) => {
    setCurrentLevel(level);
    
    // Wenn wir zum Society-Level wechseln, gehen wir zur Bubble-Ansicht
    if (level === 'society') {
      navigateToBubbleView();
    }
  };

  // Rendert die richtige Ansicht basierend auf dem aktuellen Level und der View
  const renderView = () => {
    switch (currentLevel) {
      case 'society':
        // Im Society-Level rendere basierend auf dem aktuellen View-Typ
        switch (currentView) {
          case ViewTypes.BUBBLE:
            return (
              <BubbleView 
                onContentSelect={(selectedContentId) => navigateToContentView(selectedContentId)}
              />
            );
            
          case ViewTypes.CONTENT:
            return (
              <ContentView 
                contentId={contentId}
                onSwitchToBubbleView={navigateToBubbleView}
                onSwitchToCommentView={() => navigateToCommentView(contentId)}
              />
            );
            
          case ViewTypes.COMMENT:
            return (
              <CommentView 
                contentId={contentId}
                onSwitchToContentView={() => navigateToContentView(contentId)}
              />
            );
            
          default:
            return (
              <div className="error-view">
                <h2>Fehler beim Laden der Ansicht</h2>
                <button onClick={navigateToBubbleView}>
                  Zurück zur Startseite
                </button>
              </div>
            );
        }
      
      case 'group':
        return <GroupLevelView />;
        
      case 'chat':
        return <FriendLevelView />;
        
      case 'personal':
        return <IndividualLevelView />;
        
      default:
        return (
          <div className="error-view">
            <h2>Unbekannter Level</h2>
            <button onClick={() => handleLevelChange('society')}>
              Zurück zur Hauptansicht
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        currentMode={currentLevel} 
        onModeChange={handleLevelChange}
      />
      <main className="app-content">
        {renderView()}
      </main>
    </div>
  );
};

export default Layout;