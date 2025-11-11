import type { Like } from "../../../database/postgres/entities/like-entity.js";
import type { Post } from "../../../database/postgres/entities/post-entity.js";
import type { User } from "../../../database/postgres/entities/user-entity.js";
import type { WorkoutActivity } from "../../../database/postgres/entities/workout-activity.js";

export type PublicUser = {
    id: string;
    name: string;
    email: string;
    imgURL: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string;
};

export type PublicUserProfile = PublicUser & {
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
    followers?: Array<{ id: string; name: string; }>;
    following?: Array<{ id: string; name: string; }>;
    favoriteTeams?: Array<{ id: string; name: string; }>;
    highlights?: Array<{ id: string; title: string; thumbnailUrl?: string; }>;
    tacticalAnalyses?: Array<{ id: string; title: string; }>;
};

export type PublicLike = {
    id: string;
    createdAt: string;
    updatedAt: string;
    postId?: string;
    user?: PublicUser;
};

export type PublicWorkoutActivity = {
    id: string;
    stravaId: string;
    athleteId: string;
    name: string;
    type: string;
    sportType?: string;
    startDate: string;
    endDate?: string;
    distance?: number;
    movingTime?: number;
    elapsedTime?: number;
    averageSpeed?: number;
    maxSpeed?: number;
    averageHeartRate?: number;
    maxHeartRate?: number;
    averageCadence?: number;
    averagePower?: number;
    maxPower?: number;
    elevationGain?: number;
    elevationLoss?: number;
    elevationHigh?: number;
    elevationLow?: number;
    polyline?: string;
    description?: string;
    isPrivate: boolean;
    hasKudo: boolean;
    kudosCount?: number;
    commentCount?: number;
    photoCount?: number;
    lastSyncAt?: string;
};

export type PublicPost = {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author?: PublicUser;
    parentId: string | null;
    comments: PublicPost[];
    likes: PublicLike[];
    repostedByIds: string[];
    workoutActivity?: PublicWorkoutActivity;
    workoutActivities?: PublicWorkoutActivity[];
};

const toIsoString = (value: Date | string | undefined | null): string => {
    if (!value) {
        return new Date(0).toISOString();
    }

    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

export const toPublicUser = (user: User): PublicUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    imgURL: user.imgURL ?? null,
    provider: user.provider,
    createdAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt)
});

export const toPublicUserProfile = (user: User): PublicUserProfile => {
    const publicUser: PublicUserProfile = {
        ...toPublicUser(user),
        preferences: user.preferences,
        stats: user.stats
    };

    // Adiciona followers se existirem
    if (user.followers && Array.isArray(user.followers)) {
        publicUser.followers = user.followers.map(follower => ({
            id: follower.id,
            name: follower.name
        }));
    }

    // Adiciona following se existirem
    if (user.following && Array.isArray(user.following)) {
        publicUser.following = user.following.map(followed => ({
            id: followed.id,
            name: followed.name
        }));
    }

    // Adiciona favoriteTeams se existirem
    if (user.favoriteTeams && Array.isArray(user.favoriteTeams)) {
        publicUser.favoriteTeams = user.favoriteTeams.map(team => ({
            id: team.id,
            name: team.name
        }));
    }

    // Adiciona highlights se existirem
    if (user.highlights && Array.isArray(user.highlights)) {
        publicUser.highlights = user.highlights.map(highlight => ({
            id: highlight.id,
            title: highlight.title,
            thumbnailUrl: highlight.thumbnailUrl
        }));
    }

    // Adiciona tacticalAnalyses se existirem
    if (user.tacticalAnalyses && Array.isArray(user.tacticalAnalyses)) {
        publicUser.tacticalAnalyses = user.tacticalAnalyses.map(analysis => ({
            id: analysis.id,
            title: analysis.title
        }));
    }

    return publicUser;
};

export const toPublicLike = (like: Like): PublicLike => {
    const publicLike: PublicLike = {
        id: like.id,
        createdAt: toIsoString(like.createdAt),
        updatedAt: toIsoString(like.updatedAt)
    };

    if (like.post) {
        publicLike.postId = like.post.id;
    }

    if (like.user) {
        publicLike.user = toPublicUser(like.user);
    }

    return publicLike;
};

export const toPublicWorkoutActivity = (activity: WorkoutActivity): PublicWorkoutActivity => ({
    id: activity.id,
    stravaId: activity.stravaId,
    athleteId: activity.athleteId,
    name: activity.name,
    type: activity.type,
    sportType: activity.sportType,
    startDate: toIsoString(activity.startDate),
    endDate: activity.endDate ? toIsoString(activity.endDate) : undefined,
    distance: activity.distance,
    movingTime: activity.movingTime,
    elapsedTime: activity.elapsedTime,
    averageSpeed: activity.averageSpeed,
    maxSpeed: activity.maxSpeed,
    averageHeartRate: activity.averageHeartRate,
    maxHeartRate: activity.maxHeartRate,
    averageCadence: activity.averageCadence,
    averagePower: activity.averagePower,
    maxPower: activity.maxPower,
    elevationGain: activity.elevationGain,
    elevationLoss: activity.elevationLoss,
    elevationHigh: activity.elevationHigh,
    elevationLow: activity.elevationLow,
    polyline: activity.polyline,
    description: activity.description,
    isPrivate: activity.isPrivate,
    hasKudo: activity.hasKudo,
    kudosCount: activity.kudosCount,
    commentCount: activity.commentCount,
    photoCount: activity.photoCount,
    lastSyncAt: activity.lastSyncAt ? toIsoString(activity.lastSyncAt) : undefined
});

export const toPublicPost = (post: Post): PublicPost => {
    const publicPost: PublicPost = {
        id: post.id,
        content: post.content,
        createdAt: toIsoString(post.createdAt),
        updatedAt: toIsoString(post.updatedAt),
        parentId: post.parent?.id ?? null,
        comments: post.comments?.map(toPublicPost) ?? [],
        likes: post.likes?.map(toPublicLike) ?? [],
        repostedByIds: post.repostedBy?.map(user => user.id) ?? []
    };

    if (post.author) {
        publicPost.author = toPublicUser(post.author);
    }

    if (post.workoutActivity) {
        publicPost.workoutActivity = toPublicWorkoutActivity(post.workoutActivity);
    }

    if (post.workoutActivities && post.workoutActivities.length > 0) {
        publicPost.workoutActivities = post.workoutActivities.map(toPublicWorkoutActivity);
    }

    return publicPost;
};
