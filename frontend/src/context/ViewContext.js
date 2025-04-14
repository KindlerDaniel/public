import React, { createContext, useState, useContext } from 'react';

// Definieren der verfügbaren Ansichtstypen
export const ViewTypes = {
  BUBBLE: 'bubble',
  CONTENT: 'content',
  COMMENT: 'comment'
};

// Definieren des initialen Zustands
const initialState = {
  currentView: ViewTypes.BUBBLE,
  previousView: null,
  contentId: null,
  commentThreadId: null,
  showFeed: true,
  showComments: false,
  filters: {
    beauty: false,
    wisdom: false,
    humor: false,
    timeRange: 'all'
  }
};

// Erstellen des Contexts
const ViewContext = createContext();

// Provider-Komponente
export const ViewProvider = ({ children }) => {
  const [viewState, setViewState] = useState(initialState);

  // Wechselt zur Bubble-Ansicht
  const navigateToBubbleView = () => {
    setViewState(prev => ({
      ...prev,
      previousView: prev.currentView,
      currentView: ViewTypes.BUBBLE,
      // Beim Zurückkehren zur Bubble-Ansicht behalten wir die Filter bei
    }));
  };

  // Wechselt zur Content-Ansicht und zeigt einen spezifischen Inhalt an
  const navigateToContentView = (contentId, { showFeed = true, showComments = false } = {}) => {
    setViewState(prev => ({
      ...prev,
      previousView: prev.currentView,
      currentView: ViewTypes.CONTENT,
      contentId,
      showFeed,
      showComments
    }));
  };

  // Wechselt zur Kommentar-Ansicht und zeigt einen spezifischen Kommentar-Thread an
  const navigateToCommentView = (contentId, commentThreadId = null) => {
    setViewState(prev => ({
      ...prev,
      previousView: prev.currentView,
      currentView: ViewTypes.COMMENT,
      contentId,
      commentThreadId
    }));
  };

  // Wechselt zur vorherigen Ansicht zurück
  const navigateBack = () => {
    if (viewState.previousView) {
      setViewState(prev => ({
        ...prev,
        currentView: prev.previousView,
        previousView: null
      }));
    } else {
      // Wenn keine vorherige Ansicht existiert, gehen wir zur Bubble-Ansicht
      navigateToBubbleView();
    }
  };

  // Schaltet den Feed ein oder aus
  const toggleFeed = () => {
    setViewState(prev => ({
      ...prev,
      showFeed: !prev.showFeed
    }));
  };

  // Schaltet die Kommentare ein oder aus
  const toggleComments = () => {
    setViewState(prev => ({
      ...prev,
      showComments: !prev.showComments
    }));
  };

  // Aktualisiert die Filter
  const updateFilters = (newFilters) => {
    setViewState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      }
    }));
  };

  // Stellt den Kontext-Wert bereit
  const contextValue = {
    ...viewState,
    navigateToBubbleView,
    navigateToContentView,
    navigateToCommentView,
    navigateBack,
    toggleFeed,
    toggleComments,
    updateFilters
  };

  return (
    <ViewContext.Provider value={contextValue}>
      {children}
    </ViewContext.Provider>
  );
};

// Custom Hook für einfacheren Zugriff auf den ViewContext
export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useViewContext muss innerhalb eines ViewProviders verwendet werden');
  }
  return context;
};

export default ViewContext;