import React, { createContext, useState, useContext } from 'react';
import { mockContents, mockComments } from '../utils/mockData';

// Erstellen des Contexts
const AppContext = createContext();

// Provider-Komponente für den App-weiten Zustand
export const AppProvider = ({ children }) => {
  // Mock-Daten für die Entwicklung
  const [contents, setContents] = useState(mockContents);
  const [comments, setComments] = useState(mockComments);
  
  // Ausgewählter Modus (Society, Group, etc.)
  const [currentMode, setCurrentMode] = useState('society');
  
  // Filter-Einstellungen
  const [filters, setFilters] = useState({
    beauty: false,
    wisdom: false,
    humor: false,
    timeRange: 'all' // 'all', 'hour', 'day', 'week', 'month', 'year'
  });
  
  // Rating-Funktionen
  const rateContent = (contentId, category, value) => {
    setContents(prevContents => 
      prevContents.map(content => 
        content.id === contentId 
          ? { ...content, ratings: { ...content.ratings, [category]: value }} 
          : content
      )
    );
  };
  
  const rateComment = (commentId, category, value) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, ratings: { ...comment.ratings, [category]: value }} 
          : comment
      )
    );
  };
  
  // Kommentar hinzufügen
  const addComment = (contentId, text) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      contentId,
      parentId: null,
      text,
      author: 'Current User',
      timestamp: new Date().toISOString(),
      ratings: { beauty: 0, wisdom: 0, humor: 0 }
    };
    
    setComments(prevComments => [...prevComments, newComment]);
    return newComment;
  };
  
  // Antwort auf Kommentar hinzufügen
  const addReply = (contentId, parentCommentId, text) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      contentId,
      parentId: parentCommentId,
      text,
      author: 'Current User',
      timestamp: new Date().toISOString(),
      ratings: { beauty: 0, wisdom: 0, humor: 0 }
    };
    
    setComments(prevComments => [...prevComments, newComment]);
    return newComment;
  };
  
  // Werte, die über den Context bereitgestellt werden
  const value = {
    contents,
    comments,
    currentMode,
    setCurrentMode,
    filters,
    setFilters,
    rateContent,
    rateComment,
    addComment,
    addReply
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Benutzerdefinierter Hook für den Zugriff auf den Context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};