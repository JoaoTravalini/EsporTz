export interface PlatformStats {
  overview: {
    totalUsers: number;
    totalHighlights: number;
    totalAnalyses: number;
    totalSports: number;
    totalTeams: number;
    totalMatches: number;
  };
  recentActivity: {
    newUsers: number;
    newHighlights: number;
    newAnalyses: number;
  };
  popularSports: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    highlightCount: number;
  }>;
  topCreators: Array<{
    id: string;
    name: string;
    imgURL: string | null;
    highlightCount: number;
    analysisCount: number;
    totalViews: number;
  }>;
}

export interface UserStats {
  user: {
    id: string;
    name: string;
    imgURL: string | null;
    followers: number;
    following: number;
    favoriteTeams: number;
  };
  content: {
    highlights: number;
    analyses: number;
    recentHighlights: number;
    recentAnalyses: number;
  };
  engagement: {
    totalViews: number;
    totalLikes: number;
    averageViewsPerHighlight: number;
    averageViewsPerAnalysis: number;
  };
  sportDistribution: Array<{
    sport: string;
    highlights: number;
    analyses: number;
  }>;
}

export interface SportStats {
  sport: {
    id: string;
    name: string;
    description: string;
  };
  content: {
    totalHighlights: number;
    totalAnalyses: number;
    totalMatches: number;
    recentHighlights: number;
    recentAnalyses: number;
  };
  engagement: {
    highlights: {
      totalViews: number;
      totalLikes: number;
      avgViews: number;
      avgLikes: number;
    };
    analyses: {
      totalViews: number;
      totalLikes: number;
      avgViews: number;
      avgLikes: number;
    };
  };
  topContributors: Array<{
    id: string;
    name: string;
    imgURL: string;
    highlights: number;
    analyses: number;
  }>;
}

export interface TrendingContent {
  timeframe: string;
  highlights: Array<{
    id: string;
    title: string;
    thumbnailUrl?: string;
    author: { id: string; name: string };
    views: number;
    likes: number;
  }>;
  analyses: Array<{
    id: string;
    title: string;
    author: { id: string; name: string };
    sport: { id: string; name: string };
    views: number;
    likes: number;
    isVerified?: boolean;
  }>;
}

export interface ComparisonStats {
  user1: {
    id: string;
    name: string;
    imgURL: string;
    highlights: number;
    analyses: number;
    totalViews: number;
    totalLikes: number;
  };
  user2: {
    id: string;
    name: string;
    imgURL: string;
    highlights: number;
    analyses: number;
    totalViews: number;
    totalLikes: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface MetricCard {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: string;
  color?: string;
}