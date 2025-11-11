export interface Sport {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  defaultFormation?: {
    positions: string[];
    layout: string[][];
  };
  metrics?: {
    keyStats: string[];
    units: Record<string, string>;
  };
  highlights: Array<{
    id: string;
    title: string;
  }>;
  tacticalAnalyses: Array<{
    id: string;
    title: string;
  }>;
  matches: Array<{
    id: string;
    title: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  color?: string;
  foundedYear?: number;
  stadium?: string;
  country?: string;
  league?: string;
  defaultFormation?: string[];
  squad?: Array<{
    name: string;
    position: string;
    number: number;
    nationality?: string;
    age?: number;
  }>;
  fans: Array<{
    id: string;
    name: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  title: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  homeScore: number;
  awayScore: number;
  matchDate: Date;
  venue?: string;
  competition?: string;
  duration?: number;
  lineups?: {
    home: Array<{
      player: string;
      position: string;
      number: number;
      captain?: boolean;
    }>;
    away: Array<{
      player: string;
      position: string;
      number: number;
      captain?: boolean;
    }>;
  };
  statistics?: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    passes?: { home: number; away: number };
    passAccuracy?: { home: number; away: number };
    fouls?: { home: number; away: number };
    corners?: { home: number; away: number };
    offsides?: { home: number; away: number };
    yellowCards?: { home: number; away: number };
    redCards?: { home: number; away: number };
  };
  highlights?: {
    videoUrl?: string;
    keyMoments: Array<{
      timestamp: number;
      type: 'goal' | 'chance' | 'save' | 'card' | 'substitution';
      description: string;
    }>;
  };
  sport: {
    id: string;
    name: string;
  };
  followers: Array<{
    id: string;
    name: string;
  }>;
  tacticalAnalyses: Array<{
    id: string;
    title: string;
  }>;
  events: MatchEvent[];
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'var' | 'penalty' | 'free_kick' | 'corner' | 'offside' | 'foul';
  minute: number;
  addedTime?: number;
  team: 'home' | 'away';
  player?: string;
  relatedPlayer?: string;
  description?: string;
  match: {
    id: string;
    title: string;
  };
  reportedBy?: {
    id: string;
    name: string;
  };
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}