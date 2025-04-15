import React, { useState, useEffect } from 'react';
import { getCommentsForContent } from '../../utils/mockData';
import RatingControls from '../shared/RatingControls';

interface Comment {
  id: string;
  contentId: string;
  author: string;
  text: string;
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
  replies?: Comment[];
}

interface CommentsProps {
  contentId?: string;
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

    try {
      // Fetch comments for the current content
      const fetchedComments = getCommentsForContent(contentId);
      setComments(fetchedComments || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
    }
  }, [contentId]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !contentId) return;

    // Normally this would be an API call to save the comment
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      contentId,
      author: 'Aktueller Benutzer',
      text: newComment,
      timestamp: new Date().toISOString(),
      ratings: { beauty: 0, wisdom: 0, humor: 0 },
      replies: []
    };

    setComments(prevComments => [newCommentObj, ...prevComments]);
    setNewComment('');
  };

  const handleReply = (parentId: string) => {
    // Implementation for replying to comments
    console.log('Replying to comment:', parentId);
  };

  const handleRateComment = (commentId: string, type: 'beauty' | 'wisdom' | 'humor', value: boolean) => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            ratings: {
              ...comment.ratings,
              [type]: comment.ratings[type] + (value ? 1 : -1)
            },
            userRating: {
              ...comment.userRating,
              [type]: value
            }
          };
        }
        return comment;
      })
    );
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

  const sortComments = () => {
    return [...comments].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'beauty') {
        return b.ratings.beauty - a.ratings.beauty;
      } else if (sortBy === 'wisdom') {
        return b.ratings.wisdom - a.ratings.wisdom;
      } else if (sortBy === 'humor') {
        return b.ratings.humor - a.ratings.humor;
      }
      return 0;
    });
  };

  return (
    <div className="comments-container">
      <div className="comments-header">
        <h3 className="comments-title">
          Kommentare <span className="comments-count">({comments.length})</span>
        </h3>
        <div className="comments-actions">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="beauty">Nach Schönheit</option>
            <option value="wisdom">Nach Weisheit</option>
            <option value="humor">Nach Humor</option>
          </select>
        </div>
      </div>
      
      <form className="comment-form" onSubmit={handleCommentSubmit}>
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
          sortComments().map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-timestamp">{formatTime(comment.timestamp)}</span>
              </div>
              <div className="comment-content">{comment.text}</div>
              <div className="comment-footer">
                <RatingControls 
                  contentId={comment.id}
                  ratings={comment.ratings}
                  userRating={comment.userRating}
                  onRate={(type, value) => handleRateComment(comment.id, type, value)}
                  small
                />
                <div className="comment-actions">
                  <button 
                    className="comment-reply-button"
                    onClick={() => handleReply(comment.id)}
                  >
                    Antworten
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="comments-empty">Keine Kommentare vorhanden</div>
        )}
      </div>
    </div>
  );
};

// Helper function to format timestamp
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default Comments;