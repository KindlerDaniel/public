import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import BubbleView from './components/BubbleView/BubbleView.tsx';
import CommentView from './components/CommentView/CommentView.tsx';
import ContentView from './components/ContentView/ContentView.tsx';
import { AppProvider } from './context/AppContext';
import { ViewProvider } from './context/ViewContext';

// View mode constants
const VIEW_MODES = {
  BUBBLE: 'bubble',
  CONTENT: 'content',
  COMMENT: 'comment',
};

function App() {
  // State to track which view is currently active
  const [currentView, setCurrentView] = useState(VIEW_MODES.BUBBLE);
  
  // State to track selected content across views
  const [selectedContentId, setSelectedContentId] = useState(null);
  
  // Function to switch views
  const switchView = (viewMode) => {
    setCurrentView(viewMode);
  };
  
  // Function to handle content selection
  const handleContentSelect = (contentId) => {
    setSelectedContentId(contentId);
    
    // When content is selected, switch to content view
    if (contentId && currentView === VIEW_MODES.BUBBLE) {
      switchView(VIEW_MODES.CONTENT);
    }
  };
  
  // Function to open comment view for a specific content
  const openCommentView = (contentId) => {
    setSelectedContentId(contentId);
    switchView(VIEW_MODES.COMMENT);
  };

  // Render the current view based on state
  const renderCurrentView = () => {
    switch (currentView) {
      case VIEW_MODES.BUBBLE:
        return (
          <BubbleView 
            onContentSelect={handleContentSelect}
            onSwitchToContentView={() => switchView(VIEW_MODES.CONTENT)}
          />
        );
        
      case VIEW_MODES.CONTENT:
        return (
          <ContentView 
            contentId={selectedContentId}
            onSwitchToBubbleView={() => switchView(VIEW_MODES.BUBBLE)}
            onSwitchToCommentView={() => switchView(VIEW_MODES.COMMENT)}
          />
        );
        
      case VIEW_MODES.COMMENT:
        return (
          <CommentView 
            contentId={selectedContentId}
            onSwitchToContentView={() => switchView(VIEW_MODES.CONTENT)}
          />
        );
        
      default:
        return (
          <div className="error">
            <h2>Fehler beim Laden der Ansicht</h2>
            <button onClick={() => switchView(VIEW_MODES.BUBBLE)}>
              Zurück zur Startseite
            </button>
          </div>
        );
    }
  };

  return (
    <AppProvider>
      <ViewProvider>
        <div className="App">
          <Header />
          <main className="app-content">
            {renderCurrentView()}
          </main>
          <Footer />
        </div>
      </ViewProvider>
    </AppProvider>
  );
}

export default App;