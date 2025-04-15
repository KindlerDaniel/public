import React, { useState, useEffect } from 'react';
import CommentThread from './CommentThread';
import FilterControls from '../shared/FilterControls';
import { Comment, Filters } from '../../types';
import { getCommentsForContent } from '../../utils/mockData';

interface CommentFeedProps {
  contentId?: string;
  standalone?: boolean;
  maxHeight?: string;
}

const CommentFeed: React.FC<CommentFeedProps> = ({ 
  contentId, 
  standalone = false,
  maxHeight = "600px" 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    beauty: false,
    wisdom: false,
    humor: false,
    timeRange: 'all'
  });

  useEffect(() => {
    if (!contentId) {
      setComments([]);
      setLoading(false);
      return;
    }

    // Daten für Kommentare laden
    const fetchComments = async () => {
      setLoading(true);
      try {
        // Versuche, echte Daten aus der mockData zu laden
        const commentsData = getCommentsForContent(contentId);
        
        // Konvertiere die Daten in das erwartete Format
        const formattedComments: Comment[] = commentsData.map(comment => ({
          id: comment.id,
          author: comment.author,
          content: comment.text,
          date: comment.timestamp,
          ratings: comment.ratings,
          userRating: comment.userRating || {},
          replies: formatReplies(comment.replies || [])
        }));
        
        setComments(formattedComments);
      } catch (error) {
        console.error('Fehler beim Laden der Kommentare:', error);
        // Fallback zu Mock-Daten
        const mockComments: Comment[] = [
          {
            id: '1',
            author: 'User123',
            content: 'Dies ist ein interessanter Beitrag!',
            date: '2025-04-10T10:30:00',
            replies: [
              {
                id: '1-1',
                author: 'JaneDoe',
                content: 'Ich stimme dir völlig zu. Besonders der zweite Punkt ist wichtig.',
                date: '2025-04-10T11:15:00',
                replies: [],
                ratings: { beauty: 5, wisdom: 12, humor: 2 }
              }
            ],
            ratings: { beauty: 10, wisdom: 25, humor: 5 }
          },
          {
            id: '2',
            author: 'ContentExpert',
            content: 'Aus meiner Erfahrung kann ich sagen, dass dieser Ansatz sehr effektiv ist.',
            date: '2025-04-11T09:45:00',
            replies: [],
            ratings: { beauty: 8, wisdom: 32, humor: 0 }
          },
          {
            id: '3',
            author: 'HumorGuy',
            content: 'Das erinnert mich an die Zeit, als ich versuchte, meine Katze zu programmieren!',
            date: '2025-04-12T14:20:00',
            replies: [],
            ratings: { beauty: 2, wisdom: 1, humor: 45 }
          }
        ];
        setComments(mockComments);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [contentId]);

  // Hilfsfunktion zum Formatieren von verschachtelten Antworten
  const formatReplies = (replies: any[]): Comment[] => {
    return replies.map(reply => ({
      id: reply.id,
      author: reply.author,
      content: reply.text || reply.content,
      date: reply.timestamp || reply.date,
      ratings: reply.ratings,
      userRating: reply.userRating || {},
      replies: formatReplies(reply.replies || [])
    }));
  };

  const handleFilterChange = (type: string, value: boolean | string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleNewCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !contentId) return;

    // In einer echten Implementierung würde hier ein API-Aufruf erfolgen
    const newCommentObj: Comment = {
      id: `new-${Date.now()}`,
      author: 'CurrentUser', // In einer echten Implementierung wäre das der eingeloggte Benutzer
      content: newComment,
      date: new Date().toISOString(),
      replies: [],
      ratings: { beauty: 0, wisdom: 0, humor: 0 }
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
  };

  const handleReply = (commentId: string, content: string) => {
    // Funktion zum rekursiven Suchen und Hinzufügen einer Antwort
    const addReply = (commentList: Comment[]): Comment[] => {
      return commentList.map(comment => {
        if (comment.id === commentId) {
          const newReply: Comment = {
            id: `reply-${Date.now()}`,
            author: 'CurrentUser', // In einer echten Implementierung wäre das der eingeloggte Benutzer
            content: content,
            date: new Date().toISOString(),
            replies: [],
            ratings: { beauty: 0, wisdom: 0, humor: 0 }
          };
          
          return {
            ...comment,
            replies: [...comment.replies, newReply]
          };
        }
        
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReply(comment.replies)
          };
        }
        
        return comment;
      });
    };
    
    setComments(addReply(comments));
  };

  const filterComments = (commentList: Comment[]): Comment[] => {
    return commentList.filter(comment => {
      // Wenn keine Filter aktiv sind, zeige alle Kommentare
      if (!filters.beauty && !filters.wisdom && !filters.humor) {
        return true;
      }

      // Wende Filter basierend auf Bewertungen an
      if (filters.beauty && comment.ratings.beauty > 0) return true;
      if (filters.wisdom && comment.ratings.wisdom > 0) return true;
      if (filters.humor && comment.ratings.humor > 0) return true;

      return false;
    }).map(comment => ({
      ...comment,
      replies: filterComments(comment.replies)
    }));
  };

  const filteredComments = filterComments(comments);

  const handleRateComment = (commentId: string, type: 'beauty' | 'wisdom' | 'humor', value: boolean) => {
    // Funktion zum rekursiven Suchen und Aktualisieren des Kommentars
    const updateComment = (commentList: Comment[]): Comment[] => {
      return commentList.map(comment => {
        if (comment.id === commentId) {
          // Toggle der Bewertung
          const currentRating = comment.userRating?.[type] || false;
          const ratingDiff = currentRating ? -1 : 1;
          
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
        
        // Rekursiv in Antworten suchen
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateComment(comment.replies)
          };
        }
        
        return comment;
      });
    };

    setComments(updateComment(comments));
  };

  return (
    <div className="comment-feed" style={{ maxHeight }}>
      <div className="comment-feed-header">
        <h3>Kommentare</h3>
        <FilterControls 
          onFilterChange={handleFilterChange}
          filters={filters}
        />
      </div>

      {standalone && (
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={handleNewCommentChange}
            placeholder="Schreibe einen Kommentar..."
            rows={3}
          />
          <button type="submit">Kommentar senden</button>
        </form>
      )}

      <div className="comments-container">
        {loading ? (
          <div className="loading">Kommentare werden geladen...</div>
        ) : filteredComments.length > 0 ? (
          filteredComments.map(comment => (
            <CommentThread 
              key={comment.id} 
              comment={comment} 
              onReply={handleReply} 
              onRate={handleRateComment}
            />
          ))
        ) : (
          <div className="no-comments">Keine Kommentare vorhanden</div>
        )}
      </div>
    </div>
  );
};

export default CommentFeed;