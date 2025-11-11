export interface Hashtag {
  id: string;
  tag: string;
  displayTag: string;
  postCount: number;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrendingHashtag {
  tag: string;
  displayTag: string;
  postCount: number;
  userCount: number;
  growthRate: number;
  isTrending: boolean;
}

export interface PostRecommendation {
  post: any; // Post type
  score: number;
  reasons: string[];
}

export interface UserRecommendation {
  user: any; // User type
  score: number;
  reasons: string[];
  sharedHashtags?: string[];
}
