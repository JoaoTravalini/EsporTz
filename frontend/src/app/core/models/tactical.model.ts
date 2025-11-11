export interface TacticalAnalysis {
  id: string;
  title: string;
  content: string;
  formation?: {
    home: {
      formation: string[];
      positions: Array<{ x: number; y: number; player?: string; role?: string }>;
    };
    away: {
      formation: string[];
      positions: Array<{ x: number; y: number; player?: string; role?: string }>;
    };
  };
  tacticalPatterns?: TacticalPattern[];
  keyMoments?: KeyMoment[];
  statistics?: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    passes?: { home: number; away: number };
    fouls?: { home: number; away: number };
    custom?: Record<string, any>;
  };
  aiInsights?: string;
  isPublic: boolean;
  isVerified: boolean;
  author: {
    id: string;
    name: string;
    imgURL: string | null;
  };
  sport: {
    id: string;
    name: string;
  };
  highlight?: {
    id: string;
    title: string;
    thumbnailUrl?: string;
  };
  match?: {
    id: string;
    title: string;
  };
  likedBy: Array<{
    id: string;
    name: string;
  }>;
  comments: TacticalComment[];
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TacticalPattern {
  name: string;
  description: string;
  type: 'offensive' | 'defensive' | 'transition';
  positions: Array<{ x: number; y: number; type: string }>;
}

export interface KeyMoment {
  timestamp: number;
  description: string;
  type: 'goal' | 'chance' | 'save' | 'tactical_change' | 'substitution';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface TacticalComment {
  id: string;
  content: string;
  timestamp?: number;
  drawingData?: {
    type: 'arrow' | 'circle' | 'line' | 'text';
    coordinates: number[];
    color?: string;
    size?: number;
  }[];
  author: {
    id: string;
    name: string;
    imgURL: string | null;
  };
  analysis: {
    id: string;
    title: string;
  };
  parent?: {
    id: string;
    content: string;
  };
  isVerified: boolean;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TacticalAnalysisInput {
  title: string;
  content: string;
  sportId: string;
  formation?: {
    home: {
      formation: string[];
      positions: Array<{ x: number; y: number; player?: string; role?: string }>;
    };
    away: {
      formation: string[];
      positions: Array<{ x: number; y: number; player?: string; role?: string }>;
    };
  };
  tacticalPatterns?: TacticalPattern[];
  keyMoments?: KeyMoment[];
  statistics?: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    passes?: { home: number; away: number };
    fouls?: { home: number; away: number };
    custom?: Record<string, any>;
  };
  highlightId?: string;
  matchId?: string;
  isPublic?: boolean;
}

export interface TacticalCommentInput {
  content: string;
  timestamp?: number;
  drawingData?: {
    type: 'arrow' | 'circle' | 'line' | 'text';
    coordinates: number[];
    color?: string;
    size?: number;
  }[];
  parentCommentId?: string;
}