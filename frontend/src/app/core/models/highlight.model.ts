export interface Highlight {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  tags: string[];
  isFeatured: boolean;
  isPublic: boolean;
  views: number;
  likes: number;
  author: {
    id: string;
    name: string;
    imgURL: string | null;
  };
  sport: {
    id: string;
    name: string;
    color?: string;
  };
  likedBy: Array<{
    id: string;
    name: string;
  }>;
  relatedPosts: Array<{
    id: string;
    content: string;
  }>;
  metadata?: {
    matchInfo?: {
      teams: string[];
      score: string;
      date: Date;
      competition: string;
    };
    playerStats?: any;
    performance?: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface HighlightInput {
  title: string;
  description: string;
  sportId: string;
  tags?: string[];
  metadata?: {
    matchInfo?: {
      teams: string[];
      score: string;
      date: Date;
      competition: string;
    };
    playerStats?: any;
    performance?: any;
  };
  isPublic?: boolean;
  isFeatured?: boolean;
  duration?: number;
}

export interface HighlightFilters {
  sport?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'views' | 'likes';
  order?: 'ASC' | 'DESC';
}

export interface HighlightSearchResult {
  highlights: Highlight[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}