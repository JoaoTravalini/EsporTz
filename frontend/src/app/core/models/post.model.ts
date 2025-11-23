import type { AuthUser } from './auth.model';
import type { WorkoutActivity } from '../services/workout-activities.service';

export type PublicUser = AuthUser;

export type PublicLike = {
  id: string;
  createdAt: string;
  updatedAt: string;
  postId?: string;
  user?: AuthUser;
};

export type PublicMention = {
  id: string;
  username: string;
  userId: string;
};

export type PublicPost = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: AuthUser;
  parentId: string | null;
  comments: PublicPost[];
  likes: PublicLike[];
  repostedByIds: string[];
  workoutActivities?: WorkoutActivity[];
  relatedHighlights?: Array<{
    id: string;
    title: string;
    thumbnailUrl?: string;
  }>;
  mentions?: PublicMention[];
};

export type FeedResponse = {
  posts: PublicPost[];
};

export type PostResponse = {
  post: PublicPost;
};

export type LikeResponse = {
  like: PublicLike;
  post?: PublicPost;
};

export type CommentResponse = {
  comment: PublicPost;
  post?: PublicPost;
};
