import React, { useState } from 'react';
import RatingControls from '../shared/RatingControls.tsx';
import { Comment } from '../../types.ts';

interface CommentThreadProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => void;
  onRate: (commentId: string, type: 'beauty' | 'wisdom' | 'humor', value: boolean) => void;
  depth?: number;
}

const CommentThread: React.FC<CommentThreadProps> = ({ 
  comment, 
  onReply,
  onRate, 
  depth = 0 
}) => {
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(depth < 2); // Auto-expand first two levels
  const [replyContent, setReplyContent] = useState<string>('');
  
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
  
  const handleToggleReplying = () => {
    setIsReplying(!isReplying);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };
  
  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyContent(e.target.value);
  };
  
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    onReply(comment.id, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };
  
  const handleRate = (type: 'beauty' | 'wisdom' | 'humor', value: boolean) => {
    onRate(comment.id, type, value);
  };
  
  // Calculate indent based on depth
  const indentStyle = {
    marginLeft: `${depth * 20}px`,
    width: `calc(100% - ${depth * 20}px)`
  };
  
  return (
    <div className={`comment-thread depth-${depth}`} style={indentStyle}>
      <div className="comment-container">
        <div className="comment-header">
          <div className="comment-author">{comment.author}</div>
          <div className="comment-date">{formatDate(comment.date)}</div>
        </div>
        
        <div className="comment-content">
          {comment.content}
        </div>
        
        <div className="comment-footer">
          <RatingControls 
            ratings={comment.ratings}
            userRating={comment.userRating || {}}
            onRate={handleRate}
            small
          />
          
          <div className="comment-actions">
            <button 
              className="reply-button" 
              onClick={handleToggleReplying}
            >
              {isReplying ? 'Abbrechen' : 'Antworten'}
            </button>
            
            {comment.replies.length > 0 && (
              <button 
                className="expand-button" 
                onClick={handleToggleExpanded}
              >
                {isExpanded ? 'Einklappen' : `${comment.replies.length} Antwort${comment.replies.length !== 1 ? 'en' : ''} anzeigen`}
              </button>
            )}
          </div>
        </div>
        
        {isReplying && (
          <form className="reply-form" onSubmit={handleReplySubmit}>
            <textarea
              value={replyContent}
              onChange={handleReplyChange}
              placeholder="Schreibe eine Antwort..."
              rows={3}
            />
            <button type="submit">Antworten</button>
          </form>
        )}
      </div>
      
      {isExpanded && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(reply => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onRate={onRate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;