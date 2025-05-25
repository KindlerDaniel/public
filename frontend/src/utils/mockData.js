/**
 * mockData.js - Vollständige, saubere Version
 * 
 * Dieses Modul stellt Mock-Daten für die Anwendung bereit.
 */

// Kategorie-Typen für Inhalte und Bewertungen
export const CATEGORIES = {
  BEAUTY: 'beauty',
  WISDOM: 'wisdom',
  HUMOR: 'humor'
};

// Zeitfilter-Optionen
export const TIME_RANGES = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all'
};

// Mock-Benutzer
const USERS = [
  { id: 'user1', name: 'Max Mustermann', trustScore: 85 },
  { id: 'user2', name: 'Anne Schmidt', trustScore: 92 },
  { id: 'user3', name: 'Thomas Weber', trustScore: 78 },
  { id: 'user4', name: 'Julia Fischer', trustScore: 90 },
  { id: 'user5', name: 'Markus Schneider', trustScore: 65 },
  { id: 'user6', name: 'Sabine Meyer', trustScore: 88 },
  { id: 'user7', name: 'Klaus Wagner', trustScore: 72 },
  { id: 'user8', name: 'Laura Becker', trustScore: 95 },
  { id: 'user9', name: 'Peter Hoffmann', trustScore: 81 },
  { id: 'user10', name: 'Stefanie Schäfer', trustScore: 89 }
];

// Alle Mock-Inhalte (alte + neue Typen kombiniert)
export const mockContents = [
  // Konvertierte alte Inhalte
  {
    id: 'content1',
    type: 'text',
    title: 'Lehmann lastert über Racknick',
    content: 'In einer überraschenden Wendung hat der renommierte Technikexperte Lehmann heftige Kritik an seinem Kollegen Racknick geäußert.',
    author: USERS[1],
    date: '2025-04-08T14:30:00',
    ratings: { beauty: 45, wisdom: 120, humor: 15 },
    coordinates: { x: 0.3, y: 0.4, z: 0.1 },
    tags: ['Technologie', 'KI', 'Kontroverse'],
    userRating: {}
  },
  {
    id: 'content2',
    type: 'video-landscape',
    title: 'Die Zukunft der urbanen Mobilität',
    content: 'Ein umfassender Blick auf nachhaltige Transportlösungen in modernen Städten.',
    author: USERS[3],
    date: '2025-04-10T09:15:00',
    mediaUrl: 'https://example.com/videos/urban-mobility.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/urban-mobility.jpg',
    duration: '14:25',
    ratings: { beauty: 78, wisdom: 156, humor: 12 },
    coordinates: { x: -0.5, y: 0.2, z: 0.3 },
    tags: ['Stadtplanung', 'Transport', 'Nachhaltigkeit'],
    userRating: {}
  },
  {
    id: 'content3',
    type: 'image-landscape',
    title: 'Sonnenuntergang am Berliner See',
    content: 'Ein atemberaubender Moment am Ende eines warmen Sommertages in Berlin.',
    author: USERS[7],
    date: '2025-04-12T18:45:00',
    mediaUrl: 'https://example.com/images/berlin-sunset.jpg',
    ratings: { beauty: 210, wisdom: 30, humor: 5 },
    coordinates: { x: 0.1, y: -0.6, z: -0.2 },
    tags: ['Natur', 'Berlin', 'Fotografie'],
    userRating: {}
  },

  // Neue Content-Typen
  {
    id: 'video-landscape-1',
    type: 'video-landscape',
    title: 'Die Zukunft der erneuerbaren Energien',
    content: 'Ein umfassender Blick auf innovative Technologien und deren Potential für eine nachhaltige Energieversorgung.',
    author: { id: 'user1', name: 'Dr. Sarah Weber', trustScore: 92 },
    date: '2025-05-24T14:30:00',
    mediaUrl: '/videos/renewable-energy.mp4',
    thumbnailUrl: '/api/placeholder/400/225',
    duration: '12:45',
    ratings: { beauty: 45, wisdom: 156, humor: 12 },
    coordinates: { x: 0.3, y: 0.4, z: 0.1 },
    tags: ['Energie', 'Nachhaltigkeit', 'Technologie'],
    userRating: {}
  },
  {
    id: 'video-portrait-1',
    type: 'video-portrait',
    title: 'Schneller Kochkurs: Pasta in 5 Minuten',
    content: 'Lerne, wie du in nur wenigen Minuten eine köstliche Pasta zauberst.',
    author: { id: 'user2', name: 'Marco Küchenchef', trustScore: 88 },
    date: '2025-05-23T18:15:00',
    mediaUrl: '/videos/quick-pasta.mp4',
    thumbnailUrl: '/api/placeholder/225/400',
    duration: '5:23',
    ratings: { beauty: 78, wisdom: 45, humor: 89 },
    coordinates: { x: 0.7, y: 0.2, z: 0.3 },
    tags: ['Kochen', 'Rezept', 'Schnell'],
    userRating: {}
  },
  {
    id: 'image-landscape-1',
    type: 'image-landscape',
    title: 'Alpenpanorama bei Sonnenaufgang',
    content: 'Ein atemberaubender Blick über die verschneiten Gipfel der Schweizer Alpen.',
    author: { id: 'user3', name: 'Anna Bergsteiger', trustScore: 94 },
    date: '2025-05-22T06:30:00',
    mediaUrl: '/images/alpine-sunrise.jpg',
    ratings: { beauty: 245, wisdom: 32, humor: 8 },
    coordinates: { x: 0.1, y: 0.6, z: 0.4 },
    tags: ['Natur', 'Berge', 'Fotografie'],
    userRating: {}
  },
  {
    id: 'image-portrait-1',
    type: 'image-portrait',
    title: 'Moderne Architektur in der Stadt',
    content: 'Geometrische Formen und Lichtspiele prägen diesen beeindruckenden Hochhausbau.',
    author: { id: 'user4', name: 'Thomas Architekt', trustScore: 87 },
    date: '2025-05-21T15:45:00',
    mediaUrl: '/images/modern-building.jpg',
    ratings: { beauty: 156, wisdom: 78, humor: 15 },
    coordinates: { x: 0.8, y: 0.3, z: 0.7 },
    tags: ['Architektur', 'Stadt', 'Design'],
    userRating: {}
  },
  {
    id: 'text-1',
    type: 'text',
    title: 'Die Kunst des digitalen Minimalismus',
    content: 'In einer Welt voller digitaler Ablenkungen gewinnt die bewusste Reduktion von Technologie an Bedeutung.',
    author: { id: 'user5', name: 'Lisa Philosophin', trustScore: 91 },
    date: '2025-05-20T10:20:00',
    ratings: { beauty: 67, wisdom: 198, humor: 23 },
    coordinates: { x: 0.4, y: 0.8, z: 0.2 },
    tags: ['Technologie', 'Minimalismus', 'Lebensweise'],
    userRating: {}
  },
  {
    id: 'audio-1',
    type: 'audio',
    title: 'Podcast: Entspannung durch Naturgeräusche',
    content: 'Eine beruhigende Reise durch verschiedene Naturlandschaften.',
    author: { id: 'user6', name: 'Maria Entspannung', trustScore: 85 },
    date: '2025-05-19T20:00:00',
    audioUrl: '/audio/nature-sounds.mp3',
    duration: '25:30',
    ratings: { beauty: 134, wisdom: 45, humor: 12 },
    coordinates: { x: 0.2, y: 0.5, z: 0.6 },
    tags: ['Entspannung', 'Natur', 'Meditation'],
    userRating: {}
  },
  {
    id: 'discussion-1',
    type: 'discussion',
    title: 'Debatte: Homeoffice vs. Büroarbeit',
    content: 'Eine lebhafte Diskussion über die Vor- und Nachteile von Heimarbeit.',
    question: 'Was ist produktiver: Homeoffice oder Büroarbeit?',
    author: { id: 'user7', name: 'Moderator Max', trustScore: 89 },
    date: '2025-05-18T14:00:00',
    discussion: {
      participantA: 'Elena (Pro Homeoffice)',
      participantB: 'Robert (Pro Büro)',
      exchanges: [
        {
          speaker: 'A',
          text: 'Homeoffice steigert meine Produktivität erheblich. Keine Ablenkungen durch Kollegen.'
        },
        {
          speaker: 'B',
          text: 'Im Büro profitiere ich vom direkten Austausch mit dem Team.'
        }
      ]
    },
    ratings: { beauty: 45, wisdom: 167, humor: 78 },
    coordinates: { x: 0.6, y: 0.7, z: 0.5 },
    tags: ['Arbeit', 'Diskussion', 'Homeoffice'],
    userRating: {}
  }
];

// Kompatibilitäts-Export für bestehenden Code
export const mockContentsWithTypes = mockContents.slice(3); // Nur die neuen Typen

// Mock-Kommentare
export const mockComments = {
  'content1': [
    {
      id: 'comment1-1',
      contentId: 'content1',
      parentId: null,
      author: USERS[3].name,
      text: 'Sehr interessanter Punkt zur KI-Entwicklung.',
      timestamp: '2025-04-08T15:10:00',
      ratings: { beauty: 12, wisdom: 35, humor: 2 },
      replies: []
    }
  ],
  'video-landscape-1': [
    {
      id: 'comment-vl-1',
      contentId: 'video-landscape-1',
      parentId: null,
      author: 'Energieexperte',
      text: 'Sehr informatives Video über erneuerbare Energien.',
      timestamp: '2025-05-24T15:30:00',
      ratings: { beauty: 15, wisdom: 45, humor: 3 },
      replies: []
    }
  ]
};

// Bubble-Koordinaten
export const mockBubbleCoordinates = mockContents.map(content => ({
  id: content.id,
  position: content.coordinates,
  size: (content.ratings.beauty + content.ratings.wisdom + content.ratings.humor) / 100,
  category: determineMainCategory(content.ratings)
}));

// Hilfsfunktionen
function determineMainCategory(ratings) {
  const { beauty, wisdom, humor } = ratings;
  if (beauty > wisdom && beauty > humor) return CATEGORIES.BEAUTY;
  if (wisdom > beauty && wisdom > humor) return CATEGORIES.WISDOM;
  if (humor > beauty && humor > wisdom) return CATEGORIES.HUMOR;
  return CATEGORIES.WISDOM;
}

// Filterfunktionen
export function filterContent(filters = { beauty: false, wisdom: false, humor: false, timeRange: TIME_RANGES.ALL }) {
  const now = new Date();
  let timeFilter = null;
  
  switch (filters.timeRange) {
    case TIME_RANGES.HOUR:
      timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case TIME_RANGES.DAY:
      timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case TIME_RANGES.WEEK:
      timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case TIME_RANGES.MONTH:
      timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case TIME_RANGES.YEAR:
      timeFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      timeFilter = null;
  }
  
  return mockContents.filter(content => {
    if (timeFilter && new Date(content.date) < timeFilter) {
      return false;
    }
    
    if (!filters.beauty && !filters.wisdom && !filters.humor) {
      return true;
    }
    
    const mainCategory = determineMainCategory(content.ratings);
    if (filters.beauty && mainCategory === CATEGORIES.BEAUTY) return true;
    if (filters.wisdom && mainCategory === CATEGORIES.WISDOM) return true;
    if (filters.humor && mainCategory === CATEGORIES.HUMOR) return true;
    
    return false;
  });
}

export function searchContent(query) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.toLowerCase().trim();
  return mockContents.filter(content => 
    content.title.toLowerCase().includes(searchTerm) || 
    content.content.toLowerCase().includes(searchTerm) ||
    (content.tags && content.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
    content.author.name.toLowerCase().includes(searchTerm)
  );
}

export function getFeedContent(feedType = 'trending', filters = {}) {
  let filteredContent = filterContent(filters);
  
  switch (feedType) {
    case 'trending':
      return filteredContent.sort((a, b) => {
        const sumA = a.ratings.beauty + a.ratings.wisdom + a.ratings.humor;
        const sumB = b.ratings.beauty + b.ratings.wisdom + b.ratings.humor;
        return sumB - sumA;
      });
    case 'newest':
      return filteredContent.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case 'auto':
      return filteredContent.sort((a, b) => {
        const scoreA = a.ratings.beauty + a.ratings.wisdom + a.ratings.humor;
        const scoreB = b.ratings.beauty + b.ratings.wisdom + b.ratings.humor;
        return scoreB - scoreA;
      });
    default:
      return filteredContent;
  }
}

export function getContentById(contentId) {
  return mockContents.find(content => content.id === contentId);
}

export function getCommentsForContent(contentId) {
  return mockComments[contentId] || [];
}

export function getBubbleCoordinates() {
  return mockBubbleCoordinates;
}

export function getMixedFeedContent() {
  return mockContents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function createComment(contentId, comment) {
  const newComment = {
    id: `comment-${Date.now()}`,
    contentId,
    parentId: null,
    ...comment,
    replies: [],
    timestamp: new Date().toISOString()
  };
  
  if (!mockComments[contentId]) {
    mockComments[contentId] = [];
  }
  
  mockComments[contentId].unshift(newComment);
  return newComment;
}

export function createReply(contentId, parentCommentId, reply) {
  const newReply = {
    id: `reply-${Date.now()}`,
    contentId,
    parentId: parentCommentId,
    ...reply,
    replies: [],
    timestamp: new Date().toISOString()
  };
  
  const addReply = (comments, targetId) => {
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].id === targetId) {
        if (!comments[i].replies) comments[i].replies = [];
        comments[i].replies.push(newReply);
        return true;
      }
      
      if (comments[i].replies && comments[i].replies.length > 0) {
        if (addReply(comments[i].replies, targetId)) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (mockComments[contentId]) {
    addReply(mockComments[contentId], parentCommentId);
  }
  
  return newReply;
}

export function updateContentRating(contentId, category, increment = true) {
  const content = mockContents.find(c => c.id === contentId);
  if (content && content.ratings[category] !== undefined) {
    content.ratings[category] += increment ? 1 : -1;
    if (content.ratings[category] < 0) content.ratings[category] = 0;
  }
  return content;
}

// Default Export
const mockDataAPI = {
  CATEGORIES,
  TIME_RANGES,
  mockContents,
  mockContentsWithTypes,
  filterContent,
  searchContent,
  getFeedContent,
  getContentById,
  getCommentsForContent,
  getBubbleCoordinates,
  getMixedFeedContent,
  createComment,
  createReply,
  updateContentRating
};

export default mockDataAPI;