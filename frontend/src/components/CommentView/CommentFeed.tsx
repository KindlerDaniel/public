import React, { useState, useEffect } from 'react';
import CommentThread from './CommentThread';
import FilterControls from '../shared/FilterControls';
import RatingControls from '../shared/RatingControls';
import '../../styles/CommentView.css';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  replies: Comment[];
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
  const [filters, setFilters] = useState({
    beauty: false,
    wisdom: false,
    humor: false,
    timeRange: 'all'
  });

  useEffect(() => {
    // Mock comment data fetch
    const fetchComments = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // using the contentId to get comments for a specific content
        setTimeout(() => {
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
              content: 'Aus meiner Erfahrung kann ich sagen, dass dieser Ansatz sehr effektiv ist. Wir haben ähnliche Methoden verwendet und großartige Ergebnisse erzielt.',
              date: '2025-04-11T09:45:00',
              replies: [],
              ratings: { beauty: 8, wisdom: 32, humor: 0 }
            },
            {
              id: '3',
              author: 'HumorGuy',
              content: 'Das erinnert mich an die Zeit, als ich versuchte, meine Katze zu programmieren. Sie hat nur mit "Syntax Error: Miau" geantwortet! 😂',
              date: '2025-04-12T14:20:00',
              replies: [],
              ratings: { beauty: 2, wisdom: 1, humor: 45 }
            }
          ];
          setComments(mockComments);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setLoading(false);
      }
    };

    fetchComments();
  }, [contentId]);

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
    if (!newComment.trim()) return;

    // In a real implementation, this would be an API call to submit the comment
    const newCommentObj: Comment = {
      id: `new-${Date.now()}`,
      author: 'CurrentUser', // In a real implementation, this would be the logged-in user
      content: newComment,
      date: new Date().toISOString(),
      replies: [],
      ratings: { beauty: 0, wisdom: 0, humor: 0 }
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
  };

  const filterComments = (commentList: Comment[]): Comment[] => {
    return commentList.filter(comment => {
      // If no filters are active, show all comments
      if (!filters.beauty && !filters.wisdom && !filters.humor) {
        return true;
      }

      // Apply filters based on ratings
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
    // Function to recursively find and update the comment
    const updateComment = (commentList: Comment[]): Comment[] => {
      return commentList.map(comment => {
        if (comment.id === commentId) {
          // Toggle the rating
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
        
        // Recursively search in replies
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
              onReply={() => {}} 
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