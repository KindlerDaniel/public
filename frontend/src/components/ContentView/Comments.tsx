import React, { useState, useEffect } from 'react';
import { getCommentsForContent } from '../../utils/mockData';
import '../../styles/Comments.css';
import RatingControls from '../shared/RatingControls';

interface CommentsProps {
  contentId?: string;
}

interface Comment {
  id: string;
  contentId: string;
  parentId: string | null;
  text: string;
  author: string;
  timestamp: string;
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
}

const Comments: React.FC<CommentsProps> = ({ contentId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    if (!contentId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // In einer echten Implementierung würde hier ein API-Aufruf stehen
      const commentsData = getCommentsForContent(contentId);
      setComments(commentsData);
    } catch (error) {
      console.error('Fehler beim Laden der Kommentare:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !contentId) return;

    // In einer echten Implementierung würde hier ein API-Aufruf erfolgen
    const now = new Date().toISOString();
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      contentId,
      parentId: null,
      text: newComment,
      author: 'Aktueller Benutzer', // In einer echten App würde das der aktuelle Benutzer sein
      timestamp: now,
      ratings: { beauty: 0, wisdom: 0, humor: 0 }
    };

    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  const handleReply = (parentId: string) => {
    // Implementierung für Antworten auf Kommentare
    console.log('Antwort auf Kommentar:', parentId);
    // In einer vollständigen Implementierung würde hier ein Antwortformular angezeigt
  };

  const handleRateComment = (commentId: string, type: 'beauty' | 'wisdom' | 'humor', value: boolean) => {
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          const currentValue = comment.userRating?.[type] || false;
          const ratingDiff = value === currentValue ? 0 : (value ? 1 : -1);
          
          return {
            ...comment,
            userRating: {
              ...comment.userRating,
              [type]: value
            },
            ratings: {
              ...comment.ratings,
              [type]: comment.ratings[type] + ratingDiff
            }
          };
        }
        return comment;
      })
    );
  };

  const sortComments = (comments: Comment[]) => {
    switch (sortBy) {
      case 'newest':
        return [...comments].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      case 'oldest':
        return [...comments].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      case 'beauty':
        return [...comments].sort((a, b) => b.ratings.beauty - a.ratings.beauty);
      case 'wisdom':
        return [...comments].sort((a, b) => b.ratings.wisdom - a.ratings.wisdom);
      case 'humor':
        return [...comments].sort((a, b) => b.ratings.humor - a.ratings.humor);
      default:
        return comments;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="comments-container">
      <div className="comments-header">
        <h3 className="comments-title">
          Kommentare <span className="comments-count">({comments.length})</span>
        </h3>
        <div className="comments-actions">
          <select 
            className="filter-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="beauty">Nach Schönheit</option>
            <option value="wisdom">Nach Weisheit</option>
            <option value="humor">Nach Humor</option>
          </select>
        </div>
      </div>
      
      <form className="new-comment-form" onSubmit={handleCommentSubmit}>
        <textarea 
          className="comment-input"
          placeholder="Schreibe einen Kommentar..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          type="submit" 
          className="comment-submit"
          disabled={!newComment.trim()}
        >
          Kommentar senden
        </button>
      </form>
      
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">Kommentare werden geladen...</div>
        ) : comments.length > 0 ? (
          sortComments(comments).map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-timestamp">{formatDate(comment.timestamp)}</span>
              </div>
              <div className="comment-content">{comment.text}</div>
              <div className="comment-actions">
                <div className="comment-buttons">
                  <button 
                    className="comment-button"
                    onClick={() => handleReply(comment.id)}
                  >
                    Antworten
                  </button>
                </div>
                <div className="comment-ratings">
                  <RatingControls 
                    contentId={comment.id}
                    ratings={comment.ratings}
                    userRating={comment.userRating}
                    onRate={(type, value) => handleRateComment(comment.id, type, value)}
                    isContent={false}
                    mini={true}
                    small={true}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="comments-empty">
            <p>Noch keine Kommentare. Sei der Erste, der einen Kommentar schreibt!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;