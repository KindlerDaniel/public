/**
 * mockData.js
 * 
 * Dieses Modul stellt Mock-Daten für die Anwendung bereit.
 * Es simuliert Daten, die normalerweise von einem Backend abgerufen würden.
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

// Mock-Inhalte für verschiedene Ansichten
export const mockContents = [
  {
    id: 'content1',
    type: 'article',
    title: 'Lehmann lastert über Racknick',
    content: 'In einer überraschenden Wendung hat der renommierte Technikexperte Lehmann heftige Kritik an seinem Kollegen Racknick geäußert. Er beschuldigt ihn, die neuesten Entwicklungen im Bereich künstlicher Intelligenz falsch einzuschätzen.',
    author: USERS[1],
    date: '2025-04-08T14:30:00',
    ratings: { 
      beauty: 45, 
      wisdom: 120, 
      humor: 15 
    },
    coordinates: { x: 0.3, y: 0.4, z: 0.1 },
    tags: ['Technologie', 'KI', 'Kontroverse']
  },
  {
    id: 'content2',
    type: 'video',
    title: 'Die Zukunft der urbanen Mobilität',
    content: 'https://example.com/videos/urban-mobility.mp4',
    thumbnail: 'https://example.com/thumbnails/urban-mobility.jpg',
    duration: '14:25',
    author: USERS[3],
    date: '2025-04-10T09:15:00',
    ratings: { 
      beauty: 78, 
      wisdom: 156, 
      humor: 12 
    },
    coordinates: { x: -0.5, y: 0.2, z: 0.3 },
    tags: ['Stadtplanung', 'Transport', 'Nachhaltigkeit']
  },
  {
    id: 'content3',
    type: 'image',
    title: 'Sonnenuntergang am Berliner See',
    content: 'https://example.com/images/berlin-sunset.jpg',
    author: USERS[7],
    date: '2025-04-12T18:45:00',
    ratings: { 
      beauty: 210, 
      wisdom: 30, 
      humor: 5 
    },
    coordinates: { x: 0.1, y: -0.6, z: -0.2 },
    tags: ['Natur', 'Berlin', 'Fotografie']
  },
  {
    id: 'content4',
    type: 'article',
    title: 'Neue Studie zeigt Zusammenhang zwischen Schlafqualität und Kreativität',
    content: 'Eine aktuelle Studie der Universität München hat einen direkten Zusammenhang zwischen der Schlafqualität und der kreativen Leistungsfähigkeit nachgewiesen. Probanden mit besserer Schlafqualität zeigten signifikant höhere Werte bei verschiedenen Kreativitätstests.',
    author: USERS[4],
    date: '2025-04-02T11:20:00',
    ratings: { 
      beauty: 35, 
      wisdom: 185, 
      humor: 8 
    },
    coordinates: { x: 0.7, y: 0.3, z: -0.4 },
    tags: ['Wissenschaft', 'Gesundheit', 'Psychologie']
  },
  {
    id: 'content5',
    type: 'article',
    title: 'Der Aufstieg kleiner Unternehmen in der digitalen Ära',
    content: 'Trotz der Dominanz großer Tech-Konzerne erleben wir einen bemerkenswerten Aufstieg kleiner Unternehmen, die digitale Nischen besetzen. Dieser Artikel untersucht die Faktoren, die diesen Trend begünstigen.',
    author: USERS[2],
    date: '2025-04-05T15:10:00',
    ratings: { 
      beauty: 42, 
      wisdom: 163, 
      humor: 20 
    },
    coordinates: { x: -0.2, y: -0.3, z: 0.5 },
    tags: ['Wirtschaft', 'Digitalisierung', 'Entrepreneurship']
  },
  {
    id: 'content6',
    type: 'audio',
    title: 'Podcast: Philosophie des Alltags',
    content: 'https://example.com/audio/philosophy-everyday.mp3',
    duration: '38:12',
    author: USERS[8],
    date: '2025-04-11T07:30:00',
    ratings: { 
      beauty: 58, 
      wisdom: 195, 
      humor: 45 
    },
    coordinates: { x: 0.4, y: 0.5, z: 0.6 },
    tags: ['Philosophie', 'Podcast', 'Bildung']
  },
  {
    id: 'content7',
    type: 'video',
    title: 'Der perfekte Espresso - eine Wissenschaft für sich',
    content: 'https://example.com/videos/perfect-espresso.mp4',
    thumbnail: 'https://example.com/thumbnails/perfect-espresso.jpg',
    duration: '8:45',
    author: USERS[5],
    date: '2025-04-13T10:40:00',
    ratings: { 
      beauty: 85, 
      wisdom: 110, 
      humor: 35 
    },
    coordinates: { x: -0.6, y: 0.7, z: -0.1 },
    tags: ['Kulinarik', 'Kaffee', 'Tutorial']
  },
  {
    id: 'content8',
    type: 'article',
    title: 'Die überraschenden Vorteile der Langeweile',
    content: 'Neue Forschungen zeigen, dass Langeweile ein wichtiger Zustand für unsere kognitive Gesundheit sein kann. In diesem Artikel werden die überraschenden Vorteile des "Nichtstuns" und deren Auswirkungen auf unsere Kreativität und mentale Erholung untersucht.',
    author: USERS[9],
    date: '2025-04-07T16:25:00',
    ratings: { 
      beauty: 48, 
      wisdom: 172, 
      humor: 30 
    },
    coordinates: { x: 0.2, y: -0.8, z: 0.4 },
    tags: ['Psychologie', 'Wohlbefinden', 'Forschung']
  },
  {
    id: 'content9',
    type: 'image',
    title: 'Die tanzenden Nordlichter über Norwegen',
    content: 'https://example.com/images/northern-lights.jpg',
    author: USERS[6],
    date: '2025-04-09T21:05:00',
    ratings: { 
      beauty: 245, 
      wisdom: 42, 
      humor: 3 
    },
    coordinates: { x: 0.5, y: 0.1, z: -0.7 },
    tags: ['Natur', 'Norwegen', 'Fotografie']
  },
  {
    id: 'content10',
    type: 'article',
    title: 'Humor am Arbeitsplatz: Warum lachende Teams produktiver sind',
    content: 'Studien zeigen, dass Teams, die regelmäßig gemeinsam lachen, nicht nur zufriedener sind, sondern auch produktiver arbeiten. Dieser Artikel beleuchtet die wissenschaftlichen Hintergründe und gibt praktische Tipps für mehr Humor im Büroalltag.',
    author: USERS[0],
    date: '2025-04-14T08:55:00',
    ratings: { 
      beauty: 32, 
      wisdom: 128, 
      humor: 198 
    },
    coordinates: { x: -0.3, y: 0.6, z: 0.2 },
    tags: ['Arbeitsplatz', 'Humor', 'Produktivität']
  }
];

// Mock-Kommentare für Inhalte (umstrukturiert für bessere Kompatibilität mit den Komponenten)
export const mockComments = {
  'content1': [
    {
      id: 'comment1-1',
      contentId: 'content1',
      parentId: null,
      author: USERS[3].name,
      text: 'Ich finde, Lehmann hat in vielen Punkten recht. Die Entwicklung der KI wird oft zu unkritisch betrachtet.',
      timestamp: '2025-04-08T15:10:00',
      ratings: { beauty: 12, wisdom: 35, humor: 2 },
      replies: [
        {
          id: 'comment1-1-1',
          contentId: 'content1',
          parentId: 'comment1-1',
          author: USERS[5].name,
          text: 'Das sehe ich anders. Racknick hat in seinen letzten Publikationen sehr differenziert argumentiert.',
          timestamp: '2025-04-08T16:05:00',
          ratings: { beauty: 8, wisdom: 28, humor: 1 },
          replies: []
        },
        {
          id: 'comment1-1-2',
          contentId: 'content1',
          parentId: 'comment1-1',
          author: USERS[2].name,
          text: 'Ich denke, die Wahrheit liegt wie so oft in der Mitte.',
          timestamp: '2025-04-08T17:22:00',
          ratings: { beauty: 15, wisdom: 42, humor: 5 },
          replies: []
        }
      ]
    },
    {
      id: 'comment1-2',
      contentId: 'content1',
      parentId: null,
      author: USERS[7].name,
      text: 'Diese Art von öffentlicher Kritik unter Kollegen finde ich unprofessionell.',
      timestamp: '2025-04-09T09:45:00',
      ratings: { beauty: 5, wisdom: 18, humor: 0 },
      replies: []
    }
  ],
  'content2': [
    {
      id: 'comment2-1',
      contentId: 'content2',
      parentId: null,
      author: USERS[1].name,
      text: 'Sehr informatives Video! Die Konzepte für urbane Mobilität sind wirklich durchdacht.',
      timestamp: '2025-04-10T10:30:00',
      ratings: { beauty: 9, wisdom: 24, humor: 0 },
      replies: []
    }
  ],
  'content3': [
    {
      id: 'comment3-1',
      contentId: 'content3',
      parentId: null,
      author: USERS[0].name,
      text: 'Was für ein atemberaubendes Foto! Die Farben sind unglaublich.',
      timestamp: '2025-04-12T19:20:00',
      ratings: { beauty: 32, wisdom: 3, humor: 0 },
      replies: []
    },
    {
      id: 'comment3-2',
      contentId: 'content3',
      parentId: null,
      author: USERS[9].name,
      text: 'Ich war letzte Woche dort - der See ist wirklich ein verstecktes Juwel in Berlin!',
      timestamp: '2025-04-13T08:15:00',
      ratings: { beauty: 18, wisdom: 7, humor: 2 },
      replies: []
    }
  ]
};

// Mock-Bubble-Koordinaten für die 3D-Ansicht
export const mockBubbleCoordinates = mockContents.map(content => ({
  id: content.id,
  position: content.coordinates,
  size: (content.ratings.beauty + content.ratings.wisdom + content.ratings.humor) / 100,
  category: determineMainCategory(content.ratings)
}));

// Bestimmt die Hauptkategorie eines Inhalts basierend auf den Bewertungen
function determineMainCategory(ratings) {
  const { beauty, wisdom, humor } = ratings;
  if (beauty > wisdom && beauty > humor) return CATEGORIES.BEAUTY;
  if (wisdom > beauty && wisdom > humor) return CATEGORIES.WISDOM;
  if (humor > beauty && humor > wisdom) return CATEGORIES.HUMOR;
  return CATEGORIES.WISDOM; // Fallback
}

// Filtert Inhalte basierend auf Kategorien und Zeitraum
export function filterContent(
  filters = { 
    beauty: false, 
    wisdom: false, 
    humor: false, 
    timeRange: TIME_RANGES.ALL 
  }
) {
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
    // Zeitfilter anwenden
    if (timeFilter && new Date(content.date) < timeFilter) {
      return false;
    }
    
    // Kategoriefilter anwenden
    if (!filters.beauty && !filters.wisdom && !filters.humor) {
      return true; // Wenn keine Kategorien ausgewählt sind, alle anzeigen
    }
    
    const mainCategory = determineMainCategory(content.ratings);
    
    if (filters.beauty && mainCategory === CATEGORIES.BEAUTY) return true;
    if (filters.wisdom && mainCategory === CATEGORIES.WISDOM) return true;
    if (filters.humor && mainCategory === CATEGORIES.HUMOR) return true;
    
    return false;
  });
}

// Sucht nach Inhalten basierend auf einem Suchbegriff
export function searchContent(query) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return mockContents.filter(content => 
    content.title.toLowerCase().includes(searchTerm) || 
    (typeof content.content === 'string' && content.content.toLowerCase().includes(searchTerm)) ||
    content.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    content.author.name.toLowerCase().includes(searchTerm)
  );
}

// Holt Inhalte für einen bestimmten Feed
export function getFeedContent(feedType = 'trending', filters = {}) {
  let filteredContent = filterContent(filters);
  
  switch (feedType) {
    case 'trending':
      // Sortiere nach der Summe aller Bewertungen, höchste zuerst
      return filteredContent.sort((a, b) => {
        const sumA = a.ratings.beauty + a.ratings.wisdom + a.ratings.humor;
        const sumB = b.ratings.beauty + b.ratings.wisdom + b.ratings.humor;
        return sumB - sumA;
      });
    case 'newest':
      // Sortiere nach Datum, neueste zuerst
      return filteredContent.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case 'beauty':
      // Sortiere nach Beauty-Bewertung
      return filteredContent.sort((a, b) => b.ratings.beauty - a.ratings.beauty);
    case 'wisdom':
      // Sortiere nach Wisdom-Bewertung
      return filteredContent.sort((a, b) => b.ratings.wisdom - a.ratings.wisdom);
    case 'humor':
      // Sortiere nach Humor-Bewertung
      return filteredContent.sort((a, b) => b.ratings.humor - a.ratings.humor);
    default:
      return filteredContent;
  }
}

// Holt einen einzelnen Inhalt anhand seiner ID
export function getContentById(contentId) {
  return mockContents.find(content => content.id === contentId);
}

// Holt die Kommentare für einen bestimmten Inhalt
export function getCommentsForContent(contentId) {
  return mockComments[contentId] || [];
}

// Holt die Koordinaten für die Bubble-Ansicht
export function getBubbleCoordinates() {
  return mockBubbleCoordinates;
}

// Erstellt einen neuen Kommentar
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

// Erstellt eine Antwort auf einen Kommentar
export function createReply(contentId, parentCommentId, reply) {
  const newReply = {
    id: `reply-${Date.now()}`,
    contentId,
    parentId: parentCommentId,
    ...reply,
    replies: [],
    timestamp: new Date().toISOString()
  };
  
  // Funktion zum rekursiven Suchen und Hinzufügen einer Antwort
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

// Aktualisiert die Bewertung eines Inhalts
export function updateContentRating(contentId, category, increment = true) {
  const content = mockContents.find(c => c.id === contentId);
  if (content && content.ratings[category] !== undefined) {
    content.ratings[category] += increment ? 1 : -1;
    if (content.ratings[category] < 0) content.ratings[category] = 0;
  }
  return content;
}

// Standardexport für einfachen Import
export default {
  CATEGORIES,
  TIME_RANGES,
  mockContents,
  mockComments,
  filterContent,
  searchContent,
  getFeedContent,
  getContentById,
  getCommentsForContent,
  getBubbleCoordinates,
  createComment,
  createReply,
  updateContentRating
};