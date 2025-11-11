export interface User {
  id: string;
  name: string;
  email: string;
  imgURL: string | null;
  provider: string;
  preferences?: {
    favoriteSports: string[];
    notifications: {
      highlights: boolean;
      analyses: boolean;
      matches: boolean;
      followedTeams: boolean;
    };
    privacy: {
      profilePublic: boolean;
      showStats: boolean;
      allowAnalysisSharing: boolean;
    };
  };
  stats?: UserProfileStats;
  highlights?: Array<{
    id: string;
    title: string;
    thumbnailUrl?: string;
  }>;
  tacticalAnalyses?: Array<{
    id: string;
    title: string;
  }>;
  tacticalComments?: Array<{
    id: string;
    content: string;
  }>;
  favoriteTeams?: Array<{
    id: string;
    name: string;
  }>;
  followedMatches?: Array<{
    id: string;
    title: string;
  }>;
  followers?: Array<{
    id: string;
    name: string;
  }>;
  following?: Array<{
    id: string;
    name: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  favoriteSports: string[];
  notifications: {
    highlights: boolean;
    analyses: boolean;
    matches: boolean;
    followedTeams: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showStats: boolean;
    allowAnalysisSharing: boolean;
  };
}

export interface UserProfileStats {
  highlightsCreated: number;
  analysesCreated: number;
  totalViews: number;
  totalLikes: number;
  favoriteSport?: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  imgURL?: string;
  provider?: string;
  preferences?: UserPreferences;
}