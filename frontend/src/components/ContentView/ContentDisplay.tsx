import React, { useState, useEffect } from 'react';
import '../../styles/ContentDisplay.css';
import { getContentById, updateContentRating } from '../../utils/mockData';
import RatingControls from '../shared/RatingControls';

interface ContentDisplayProps {
  contentId?: string;
  compact?: boolean;
  onViewComments?: () => void;
  onSwitchToBubbleView?: () => void;
  onSwitchToCommentView?: () => void;
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    trustScore: number;
  };
  date: string;
  ratings: {
    beauty: number;
    wisdom: number;
    humor: number;
  };
  userRating?: {
    beauty?: boolean;
    wisdom?: boolean;
    humor?: boolean;
  };
  tags?: string[];
  mediaUrl?: string;
  thumbnail?: string;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ 
  contentId, 
  compact = false,
  onViewComments,
  onSwitchToBubbleView,
  onSwitchToCommentView
}) => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lade Inhalt basierend auf contentId
  useEffect(() => {
    if (!contentId) {
      setContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // In einer echten Implementierung würde hier ein API-Aufruf stehen
      const contentData = getContentById(contentId);
      if (contentData) {
        setContent(contentData);
        setError(null);
      } else {
        setError('Der angeforderte Inhalt konnte nicht gefunden werden.');
      }
    } catch (err) {
      console.error('Fehler beim Laden des Inhalts:', err);
      setError('Der Inhalt konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  // Handler für das Bewerten von Inhalten
  const handleRate = (type: 'beauty' | 'wisdom' | 'humor', value: boolean) => {
    if (!content) return;
    
    // In einer echten Implementierung würde hier ein API-Aufruf stehen
    const updatedContent = updateContentRating(content.id, type, value);
    if (updatedContent) {
      setContent({
        ...content,
        ratings: updatedContent.ratings,
        userRating: {
          ...content.userRating,
          [type]: value
        }
      });
    }
  };

  // Formatiert das Datum
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Rendert Medieninhalte basierend auf dem Content-Typ
  const renderMedia = () => {
    if (!content) return null;

    switch (content.type) {
      case 'video':
        return (
          <div className="content-media-container">
            <video 
              className="content-media"
              controls
              poster={content.thumbnail}
            >
              <source src={content.mediaUrl || ''} type="video/mp4" />
              Dein Browser unterstützt das Video-Tag nicht.
            </video>
          </div>
        );
      case 'image':
        return (
          <div className="content-media-container">
            <img 
              className="content-media"
              src={typeof content.content === 'string' ? content.content : '/api/placeholder/800/450'} 
              alt={content.title}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="content-media-container audio">
            <audio 
              className="content-audio"
              controls
            >
              <source src={content.mediaUrl || ''} type="audio/mpeg" />
              Dein Browser unterstützt das Audio-Tag nicht.
            </audio>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="content-loading">Inhalt wird geladen...</div>;
  }

  if (error) {
    return <div className="content-error">{error}</div>;
  }

  if (!content) {
    return (
      <div className="content-empty">
        <h2>Kein Inhalt ausgewählt</h2>
        <p>Wähle einen Inhalt aus dem Feed aus oder kehre zur Kugel-Ansicht zurück.</p>
        
        {onSwitchToBubbleView && (