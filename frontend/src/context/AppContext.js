import React, { createContext, useState, useContext } from 'react';
import { mockContents as initialContents } from '../utils/mockData';

// Erstellen des Contexts
const AppContext = createContext();

// Provider-Komponente für den App-weiten Zustand
export const AppProvider = ({ children }) => {
  // Mock-Daten für die Entwicklung
  const [contents, setContents] = useState(initialContents);
  const [comments, setComments] = useState({});
  
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
          ? { 
              ...content, 
              ratings: { 
                ...content.ratings, 
                [category]: content.ratings[category] + (value ? 1 : -1) 
              },
              userRating: {
                ...content.userRating,
                [category]: value
              }
            } 
          : content
      )
    );
  };
  
  const rateComment = (contentId, commentId, category, value) => {
    if (!comments[contentId]) return;
    
    const updateCommentRating = (commentsList) => {
      return commentsList.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            ratings: {
              ...comment.ratings,
              [category]: comment.ratings[category] + (value ? 1 : -1)
            },
            userRating: {
              ...comment.userRating,
              [category]: value
            }
          };
        }
        
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentRating(comment.replies)
          };
        }
        
        return comment;
      });
    };
    
    setComments(prevComments => ({
      ...prevComments,
      [contentId]: updateCommentRating(prevComments[contentId] || [])
    }));
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
      ratings: { beauty: 0, wisdom: 0, humor: 0 },
      userRating: {},
      replies: []
    };
    
    setComments(prevComments => ({
      ...prevComments,
      [contentId]: [newComment, ...(prevComments[contentId] || [])]
    }));
    
    return newComment;
  };
  
  // Antwort auf Kommentar hinzufügen
  const addReply = (contentId, parentCommentId, text) => {
    if (!comments[contentId]) return null;
    
    const newReply = {
      id: `reply-${Date.now()}`,
      contentId,
      parentId: parentCommentId,
      text,
      author: 'Current User',
      timestamp: new Date().toISOString(),
      ratings: { beauty: 0, wisdom: 0, humor: 0 },
      userRating: {},
      replies: []
    };
    
    const addReplyToComments = (commentsList, targetId) => {
      return commentsList.map(comment => {
        if (comment.id === targetId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyToComments(comment.replies, targetId)
          };
        }
        
        return comment;
      });
    };
    
    setComments(prevComments => ({
      ...prevComments,
      [contentId]: addReplyToComments(prevComments[contentId] || [], parentCommentId)
    }));
    
    return newReply;
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