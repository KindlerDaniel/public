import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import './MyContents.css';
import ContentCreator from './ContentCreator';
import './ContentCreator.css';
import Feed from '../1SocietyLevel/ContentView/Feed.tsx';
import { AuthContext } from '../../context/AuthContext';

// Debug helper function: Prints important information about a content object
const debugContentObject = (content, index) => {
  try {
    console.log(`------ Content #${index} Debug ------`);
    console.log(`ID: ${content?.id || 'Not defined'}`);
    console.log(`Title: ${content?.title || 'Not defined'}`);
    console.log(`Type: ${content?.type || 'Not defined'}`);
    console.log(`MediaURL: ${content?.mediaUrl || 'Not defined'}`);
    console.log(`Content: ${typeof content?.content === 'string' ? content.content.substring(0, 50) + '...' : 'No text content'}`);
    console.log('--------------------------------');
  } catch (error) {
    console.error('Error during debug logging:', error);
  }
};

// Helper function: Converts MinIO URLs - but NO longer converts to gateway URLs!
const convertToAuthenticatedMediaUrl = (url, token) => {
  // Check if url is a string
  if (!url || typeof url !== 'string') {
    console.log('URL is not a string:', url);
    return url;
  }
  
  // Debug information for URL processing
  console.log(`URL is no longer converted, using direct MinIO URL: ${url}`);
  
  // IMPORTANT: Use direct access to MinIO without gateway!
  // The MediaService creates URLs with localhost:9000 that work directly
  // We don't need to convert anything here anymore!
  return url;
  
  /* The old conversion (no longer used):
  try {
    if (url.includes('localhost:9000')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      if (pathParts.length >= 3) {
        const bucket = pathParts[1];
        const fileName = pathParts.slice(2).join('/');
        
        if (token && typeof token === 'string') {
          return `http://localhost:8000/api/media/file/${bucket}/${fileName}?token=${token}`;
        } else {
          return `http://localhost:8000/api/media/file/${bucket}/${fileName}`;
        }
      }
    }
  } catch (error) {
    console.error('Error converting media URL:', error);
  }
  */
};

const MyContents = () => {
  // Auth context for token management and user data
  const { token, isAuthenticated, user } = useContext(AuthContext);
  
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [width, setWidth] = useState(500); // Standardbreite wie im Original-Feed
  const [isDragging, setIsDragging] = useState(false);
  const feedRef = useRef(null);
  const resizeHandleRef = useRef(null);
  
  // Define constants for min and max width
  const minWidth = 250;
  const maxWidth = 700;

  // Load all contents for this user
  const loadContents = useCallback(async () => {
    // Check if the user is authenticated
    if (!isAuthenticated || !token) {
      setMessage('Please log in to view your content.');
      return;
    }
    
    // Kein Ladehinweis mehr anzeigen - stattdessen nur den Spinner
    try {
      // Authentifizierter API-Aufruf mit Bearer-Token
      const response = await fetch('http://localhost:8000/api/media/content', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we received an array or an object with contents property
      if (Array.isArray(data)) {
        // Konvertieren aller MinIO-URLs zu authentifizierten URLs
        const processedData = data.map(convertToAuthenticatedMediaUrl);
        setContents(processedData);
        setLoading(false); // Loading-Status beenden
        
        // Feedback-Message setzen
        if (processedData.length === 0) {
          setMessage(''); // Keine Nachricht mehr anzeigen
        } else {
          setMessage('');
          console.log('Medieninhalte mit authentifizierten URLs geladen:', processedData);
        }
      } else if (data.contents && Array.isArray(data.contents)) {
        // Konvertieren aller MinIO-URLs zu authentifizierten URLs
        const processedData = data.contents.map(convertToAuthenticatedMediaUrl);
        setContents(processedData);
        setLoading(false); // Loading-Status beenden
        
        // Feedback-Message setzen
        if (processedData.length === 0) {
          setMessage(''); // Keine Nachricht mehr anzeigen
        } else {
          setMessage('');
          console.log('Medieninhalte mit authentifizierten URLs geladen:', processedData);
        }
      } else {
        console.error('Unexpected data format:', data);
        setContents([]);
        setLoading(false); // Loading-Status beenden
        setMessage('No content available - unexpected data format');
      }
    } catch (error) {
      console.error('Load contents error:', error);
      setLoading(false); // Loading-Status beenden auch bei Fehler
      setMessage(`Error loading content: ${error.message}`);
    }
  }, [isAuthenticated, token, setContents, setLoading, setMessage]);

  useEffect(() => {
    loadContents();
  }, [isAuthenticated, token, loadContents]);

  // Handler for saving new content items
  const handleSaveContent = (newContent) => {
    // Close content creator
    setShowContentCreator(false);
    
    // Don't show success message anymore
    setMessage('');
    
    // Short delay for backend processing
    setTimeout(() => {
      // Reload all contents to get current server state
      loadContents();
    }, 1000);
  };

  // Handler for canceling content creation
  const handleCancelContentCreation = () => {
    setShowContentCreator(false);
  };

  // Sets the CSS variable for initial width and on changes
  useEffect(() => {
    document.documentElement.style.setProperty('--feed-width', `${width}px`);
    if (feedRef.current) {
      feedRef.current.style.width = `${width}px`;
    }
  }, [width]);
  
  // Resize handle functionality - following the pattern from FeedArea.tsx
  const handleResizeStart = (e) => {
    e.preventDefault(); // Prevents text selection during drag
    setIsDragging(true);
  };
  
  // Effect for handling mouse dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && feedRef.current) {
        const newWidth = e.clientX;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
          document.documentElement.style.setProperty('--feed-width', `${newWidth}px`);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth]);

  return (
    <>
      {/* Plus button for new content - pulses while loading */}
      <button 
        className={`create-content-fixed-button ${!loading && contents.length > 0 ? 'has-content' : 'no-content'} ${loading ? 'is-loading' : ''}`}
        onClick={() => setShowContentCreator(true)}
        title="Create new content"
      >
        +
      </button>
      
      {/* Loading indicator was moved to the feed container */}
          
      {/* Status message always visible */}
      {message && (
        <div className="message-overlay">
          <span className={message.includes('successful') ? 'success' : 'error'}>
            {message}
          </span>
        </div>
      )}

      {/* Main area */}
      {showContentCreator ? (
        <ContentCreator 
          onSave={handleSaveContent} 
          onCancel={handleCancelContentCreation} 
        />
      ) : loading ? (
        // No separate loading indicator needed anymore, as the + button pulses
        null
      ) : contents.length > 0 ? (
        <div 
          className="direct-feed-container"
          ref={feedRef}
          style={{ width: `${width}px` }}
        >
          {/* Resize handle */}
          <div 
            className="feed-resize-handle"
            ref={resizeHandleRef}
            onMouseDown={handleResizeStart}
          >
            <div className="handle-line"></div>
          </div>
          
          {/* Feed with contents */}
          <Feed
            feedType="mine" 
            compact={true}
            customContents={contents.map((content, index) => {
              // Debug of original content
              debugContentObject(content, index);
              
              console.log('Processing content:', content);
              
              // IMPORTANT: Determine the correct URL for media content (images etc.)
              let mediaUrl = null;
              
              // Improved type detection - multiple ways to recognize an image type
              const contentType = (content?.type || '').toLowerCase();
              const mimeType = (content?.mimeType || '').toLowerCase();
              const fileType = (content?.fileType || '').toLowerCase();
              
              // Detects image types through multiple fields
              const isImage = contentType.includes('image') || 
                              mimeType.includes('image') || 
                              fileType.includes('image') || 
                              (content?.fileName || '').match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i);
              
              const isVideo = contentType.includes('video') || 
                              mimeType.includes('video') || 
                              fileType.includes('video') || 
                              (content?.fileName || '').match(/\.(mp4|webm|avi|mov|wmv)$/i);
              
              const isAudio = contentType.includes('audio') || 
                              mimeType.includes('audio') || 
                              fileType.includes('audio') || 
                              (content?.fileName || '').match(/\.(mp3|wav|ogg|aac)$/i);
              
              console.log(`Content #${index}: Type detection:`, { 
                contentType, mimeType, fileType, 
                isImage, isVideo, isAudio 
              });
              
              // Option 1: Explicit mediaUrl from content object
              if (typeof content?.mediaUrl === 'string' && content.mediaUrl.trim() !== '') {
                mediaUrl = content.mediaUrl;
                console.log(`Content #${index}: Using explicit mediaUrl: ${mediaUrl}`);
              }
              // Option 2: For image types - url field might exist
              else if (isImage && typeof content?.url === 'string' && content.url.trim() !== '') {
                mediaUrl = content.url;
                console.log(`Content #${index}: Using url field as mediaUrl: ${mediaUrl}`);
              }
              // Option 3: Specific field 'path' might exist
              else if (typeof content?.path === 'string' && content.path.trim() !== '') {
                mediaUrl = content.path;
                console.log(`Content #${index}: Using path field as mediaUrl: ${mediaUrl}`);
              }
              // Option 4: For image types - content field might be a URL
              else if (isImage && 
                  typeof content?.content === 'string' && 
                  (content.content.startsWith('http://') || 
                   content.content.startsWith('https://') || 
                   content.content.startsWith('/') ||
                   content.content.includes('minio') ||
                   content.content.includes('localhost'))) {
                mediaUrl = content.content;
                console.log(`Content #${index}: Using content as mediaUrl: ${mediaUrl}`);
              }
              
              // Fix URL if relative
              if (mediaUrl && mediaUrl.startsWith('/')) {
                mediaUrl = `http://localhost:8000${mediaUrl}`;
                console.log(`Content #${index}: Converted relative URL to absolute URL: ${mediaUrl}`);
              }
              
              // Convert URL if it's a MinIO URL
              if (typeof mediaUrl === 'string' && 
                  (mediaUrl.includes('localhost:9000') || mediaUrl.includes('minio'))) {
                const originalUrl = mediaUrl;
                mediaUrl = convertToAuthenticatedMediaUrl(mediaUrl, token);
                console.log(`Content #${index}: URL converted from ${originalUrl} to ${mediaUrl} (With Token: ${!!token})`);
              }
              
              // Debug output for detected mediaUrl before creating ContentItem
              console.log(`Content #${index} finale mediaUrl:`, mediaUrl);
              
              // Create a ContentItem with guaranteed media URL
              const contentItem = {
                // Convert id to number if it's a string, otherwise generate temporary ID
                id: content?.id ? (typeof content.id === 'string' ? parseInt(content.id, 10) || index + 1 : content.id) : index + 1,
                title: content?.title || 'Untitled',
                // For text content - use content as text
                content: (!isImage && !isVideo && !isAudio) ? 
                        (content?.content || 'No description') : '',
                // Important: For media content - always set the URL explicitly
                mediaUrl: mediaUrl || (isImage ? '/api/placeholder/400/225' : ''),
                // Set type correctly based on extended detection
                type: isImage ? 'image-landscape' : 
                      isVideo ? 'video-landscape' : 
                      isAudio ? 'audio' : 'text',
                // Add missing required properties for ContentItem
                authorId: content?.authorId || 0,
                ratings: content?.ratings || { beauty: 0, wisdom: 0, humor: 0 },
                date: content?.createdAt || content?.date || new Date().toISOString(),
                createdAt: content?.createdAt || content?.date || new Date().toISOString(),
                updatedAt: content?.updatedAt || content?.date || new Date().toISOString(),
                author: content?.author || { name: user?.username || 'Anonymous' }
              };
              
              console.log(`Content #${index} finales ContentItem:`, contentItem);
              return contentItem;
            })}
            onSelectContent={() => {}} // No action on selection
          />
        </div>
      ) : null /* No container shown when there are no contents */}
    </>
  );
};

export default MyContents;
