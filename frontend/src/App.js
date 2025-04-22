import React from 'react';
import './App.css';
import BubbleView from './views/BubbleView/BubbleView.tsx';
import CommentView from './views/CommentView/CommentView.tsx';
import ContentView from './views/ContentView/ContentView.tsx';
import { AppProvider } from './context/AppContext.js';
import { ViewProvider, ViewTypes, useViewContext } from './context/ViewContext.js';
import Sidebar from './Sidebar.tsx';

function App() {
  // Anstatt lokalen Zustand zu verwalten, verwenden wir den ViewContext
  const AppContent = () => {
    const { 
      currentView, 
      contentId,
      currentMode,
      setCurrentMode,
      navigateToBubbleView,
      navigateToContentView,
      navigateToCommentView
    } = useViewContext();
    
    // Rendert die aktuelle Ansicht basierend auf dem View-Kontext
    const renderCurrentView = () => {
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
            <div className="error">
              <h2>Fehler beim Laden der Ansicht</h2>
              <button onClick={navigateToBubbleView}>
                Zurück zur Startseite
              </button>
            </div>
          );
      }
    };

    return (
      <div className="App">
        <div className="app-layout">
          <Sidebar 
            currentMode={currentMode} 
            onModeChange={setCurrentMode}
          />
          <main className="app-content">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    );
  };

  return (
    <AppProvider>
      <ViewProvider>
        <AppContent />
      </ViewProvider>
    </AppProvider>
  );
}

export default App;