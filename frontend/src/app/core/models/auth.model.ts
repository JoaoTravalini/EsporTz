export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  imgURL: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
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
  stats?: {
    highlightsCreated: number;
    analysesCreated: number;
    totalViews: number;
    totalLikes: number;
    favoriteSport?: string;
  };
  followers?: Array<{
    id: string;
    name: string;
  }>;
  following?: Array<{
    id: string;
    name: string;
  }>;
  favoriteTeams?: Array<{
    id: string;
    name: string;
  }>;
};

export type AuthSuccessResponse = {
  user: AuthUser;
  token: string;
};
