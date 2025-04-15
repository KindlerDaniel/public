import React from 'react';
import './App.css';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import BubbleView from './components/BubbleView/BubbleView.tsx';
import CommentView from './components/CommentView/CommentView.tsx';
import ContentView from './components/ContentView/ContentView.tsx';
import { AppProvider } from './context/AppContext.js';
import { ViewProvider, ViewTypes, useViewContext } from './context/ViewContext.js';

function App() {
  // Anstatt lokalen Zustand zu verwalten, verwenden wir den ViewContext
  const AppContent = () => {
    const { 
      currentView, 
      contentId,
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
        <Header />
        <main className="app-content">
          {renderCurrentView()}
        </main>
        <Footer />
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