import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { AppDataSource } from "../../../database/postgres/data-source.js";
import { User } from "../../../database/postgres/entities/user-entity.js";
import { Highlight } from "../../../database/postgres/entities/Highlight.js";
import { TacticalAnalysis } from "../../../database/postgres/entities/TacticalAnalysis.js";
import { Sport } from "../../../database/postgres/entities/Sport.js";
import { Team } from "../../../database/postgres/entities/Team.js";
import { Match } from "../../../database/postgres/entities/Match.js";

const userRepository = AppDataSource.getRepository(User);
const highlightRepository = AppDataSource.getRepository(Highlight);
const tacticalRepository = AppDataSource.getRepository(TacticalAnalysis);
const sportRepository = AppDataSource.getRepository(Sport);
const teamRepository = AppDataSource.getRepository(Team);
const matchRepository = AppDataSource.getRepository(Match);

// Get global platform statistics
export const getPlatformStats = asyncHandler(async (req: Request, res: Response) => {
    const totalUsers = await userRepository.count();
    const totalHighlights = await highlightRepository.count();
    const totalAnalyses = await tacticalRepository.count();
    const totalSports = await sportRepository.count();
    const totalTeams = await teamRepository.count();
    const totalMatches = await matchRepository.count();

    // Get user growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await userRepository.count({
        where: {
            createdAt: thirtyDaysAgo as any
        }
    });

    const recentHighlights = await highlightRepository.count({
        where: {
            createdAt: thirtyDaysAgo as any
        }
    });

    const recentAnalyses = await tacticalRepository.count({
        where: {
            createdAt: thirtyDaysAgo as any
        }
    });

    // Get most popular sports
    const popularSports = await sportRepository
        .createQueryBuilder("sport")
        .leftJoin("sport.highlights", "highlights")
        .addSelect("COUNT(highlights.id)", "highlightCount")
        .groupBy("sport.id")
        .orderBy('"highlightCount"', "DESC")
        .limit(5)
        .getRawMany();

    // Get top content creators
    const topCreators = await userRepository
        .createQueryBuilder("user")
        .leftJoin("user.highlights", "highlights")
        .leftJoin("user.tacticalAnalyses", "analyses")
        .addSelect("COUNT(DISTINCT highlights.id)", "highlightCount")
        .addSelect("COUNT(DISTINCT analyses.id)", "analysisCount")
        .groupBy("user.id")
        .orderBy("COUNT(DISTINCT highlights.id) + COUNT(DISTINCT analyses.id)", "DESC")
        .limit(10)
        .getRawMany();

    res.json({
        overview: {
            totalUsers,
            totalHighlights,
            totalAnalyses,
            totalSports,
            totalTeams,
            totalMatches
        },
        recentActivity: {
            newUsers: recentUsers,
            newHighlights: recentHighlights,
            newAnalyses: recentAnalyses
        },
        popularSports: popularSports.map(sport => ({
            ...sport,
            highlightCount: parseInt(sport.highlightCount)
        })),
        topCreators: topCreators.map(creator => ({
            ...creator,
            highlightCount: parseInt(creator.highlightCount),
            analysisCount: parseInt(creator.analysisCount)
        }))
    });
});

// Get user statistics
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["highlights", "tacticalAnalyses", "favoriteTeams", "followers", "following"]
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const userHighlights = await highlightRepository.count({
        where: { author: { id: userId } }
    });

    const userAnalyses = await tacticalRepository.count({
        where: { author: { id: userId } }
    });

    // Get total views and likes
    const highlightStats = await highlightRepository
        .createQueryBuilder("highlight")
        .select("SUM(highlight.views)", "totalViews")
        .addSelect("SUM(highlight.likes)", "totalLikes")
        .where("highlight.author.id = :userId", { userId })
        .getRawOne();

    const analysisStats = await tacticalRepository
        .createQueryBuilder("analysis")
        .select("SUM(analysis.views)", "totalViews")
        .addSelect("SUM(analysis.likes)", "totalLikes")
        .where("analysis.author.id = :userId", { userId })
        .getRawOne();

    const totalViews = (parseInt(highlightStats?.totalViews) || 0) + (parseInt(analysisStats?.totalViews) || 0);
    const totalLikes = (parseInt(highlightStats?.totalLikes) || 0) + (parseInt(analysisStats?.totalLikes) || 0);

    // Get activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentHighlights = await highlightRepository.count({
        where: {
            author: { id: userId }
        }
    });

    const recentAnalyses = await tacticalRepository.count({
        where: {
            author: { id: userId }
        }
    });

    // Get sport-specific stats
    const sportStats = await sportRepository
        .createQueryBuilder("sport")
        .leftJoin("sport.highlights", "highlights")
        .leftJoin("sport.tacticalAnalyses", "analyses")
        .select("sport.name", "sportName")
        .addSelect("COUNT(DISTINCT highlights.id)", "highlightCount")
        .addSelect("COUNT(DISTINCT analyses.id)", "analysisCount")
        .where("(highlights.author.id = :userId OR analyses.author.id = :userId)", { userId })
        .groupBy("sport.id")
        .getRawMany();

    res.json({
        user: {
            id: user.id,
            name: user.name,
            imgURL: user.imgURL,
            followers: user.followers?.length || 0,
            following: user.following?.length || 0,
            favoriteTeams: user.favoriteTeams?.length || 0
        },
        content: {
            highlights: userHighlights,
            analyses: userAnalyses,
            recentHighlights,
            recentAnalyses
        },
        engagement: {
            totalViews,
            totalLikes,
            averageViewsPerHighlight: userHighlights > 0 ? Math.round(totalViews / userHighlights) : 0,
            averageViewsPerAnalysis: userAnalyses > 0 ? Math.round(totalViews / userAnalyses) : 0
        },
        sportDistribution: sportStats.map(stat => ({
            sport: stat.sportName,
            highlights: parseInt(stat.highlightCount),
            analyses: parseInt(stat.analysisCount)
        }))
    });
});

// Get sport-specific statistics
export const getSportStats = asyncHandler(async (req: Request, res: Response) => {
    const { sportId } = req.params;

    if (!sportId) {
        return res.status(400).json({ error: "Invalid sport ID" });
    }

    const sport = await sportRepository.findOne({
        where: { id: sportId },
        relations: ["highlights", "tacticalAnalyses", "matches"]
    });

    if (!sport) {
        return res.status(404).json({ error: "Sport not found" });
    }

    const totalHighlights = await highlightRepository.count({
        where: { sport: { id: sportId } }
    });

    const totalAnalyses = await tacticalRepository.count({
        where: { sport: { id: sportId } }
    });

    const totalMatches = await matchRepository.count({
        where: { sport: { id: sportId } }
    });

    // Get top contributors for this sport
    const topContributors = await userRepository
        .createQueryBuilder("user")
        .leftJoin("user.highlights", "highlights")
        .leftJoin("user.tacticalAnalyses", "analyses")
        .select("user.id", "userId")
        .addSelect("user.name", "userName")
        .addSelect("user.imgURL", "userImage")
        .addSelect("COUNT(DISTINCT highlights.id)", "highlightCount")
        .addSelect("COUNT(DISTINCT analyses.id)", "analysisCount")
        .where("(highlights.sport.id = :sportId OR analyses.sport.id = :sportId)", { sportId })
        .groupBy("user.id")
        .orderBy('"highlightCount"', "DESC")
        .addOrderBy('"analysisCount"', "DESC")
        .limit(10)
        .getRawMany();

    // Get engagement metrics
    const highlightEngagement = await highlightRepository
        .createQueryBuilder("highlight")
        .select("AVG(highlight.views)", "avgViews")
        .addSelect("AVG(highlight.likes)", "avgLikes")
        .addSelect("SUM(highlight.views)", "totalViews")
        .addSelect("SUM(highlight.likes)", "totalLikes")
        .where("highlight.sport.id = :sportId", { sportId })
        .getRawOne();

    const analysisEngagement = await tacticalRepository
        .createQueryBuilder("analysis")
        .select("AVG(analysis.views)", "avgViews")
        .addSelect("AVG(analysis.likes)", "avgLikes")
        .addSelect("SUM(analysis.views)", "totalViews")
        .addSelect("SUM(analysis.likes)", "totalLikes")
        .where("analysis.sport.id = :sportId", { sportId })
        .getRawOne();

    // Get activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentHighlights = await highlightRepository.count({
        where: {
            sport: { id: sportId }
        }
    });

    const recentAnalyses = await tacticalRepository.count({
        where: {
            sport: { id: sportId }
        }
    });

    res.json({
        sport: {
            id: sport.id,
            name: sport.name,
            description: sport.description
        },
        content: {
            totalHighlights,
            totalAnalyses,
            totalMatches,
            recentHighlights,
            recentAnalyses
        },
        engagement: {
            highlights: {
                totalViews: parseInt(highlightEngagement?.totalViews) || 0,
                totalLikes: parseInt(highlightEngagement?.totalLikes) || 0,
                avgViews: parseFloat(highlightEngagement?.avgViews) || 0,
                avgLikes: parseFloat(highlightEngagement?.avgLikes) || 0
            },
            analyses: {
                totalViews: parseInt(analysisEngagement?.totalViews) || 0,
                totalLikes: parseInt(analysisEngagement?.totalLikes) || 0,
                avgViews: parseFloat(analysisEngagement?.avgViews) || 0,
                avgLikes: parseFloat(analysisEngagement?.avgLikes) || 0
            }
        },
        topContributors: topContributors.map(contributor => ({
            id: contributor.userId,
            name: contributor.userName,
            imgURL: contributor.userImage,
            highlights: parseInt(contributor.highlightCount),
            analyses: parseInt(contributor.analysisCount)
        }))
    });
});

// Get trending content
export const getTrendingContent = asyncHandler(async (req: Request, res: Response) => {
    const { timeframe = '7d', type = 'all' } = req.query;

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
        case '1d':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    let trendingHighlights: any[] = [];
    let trendingAnalyses: any[] = [];

    if (type === 'all' || type === 'highlights') {
        trendingHighlights = await highlightRepository
            .createQueryBuilder("highlight")
            .leftJoinAndSelect("highlight.author", "author")
            .leftJoinAndSelect("highlight.sport", "sport")
            .where("highlight.createdAt >= :startDate", { startDate })
            .andWhere("highlight.isPublic = :isPublic", { isPublic: true })
            .orderBy("highlight.views", "DESC")
            .addOrderBy("highlight.likes", "DESC")
            .limit(10)
            .getMany();
    }

    if (type === 'all' || type === 'analyses') {
        trendingAnalyses = await tacticalRepository
            .createQueryBuilder("analysis")
            .leftJoinAndSelect("analysis.author", "author")
            .leftJoinAndSelect("analysis.sport", "sport")
            .where("analysis.createdAt >= :startDate", { startDate })
            .andWhere("analysis.isPublic = :isPublic", { isPublic: true })
            .orderBy("analysis.views", "DESC")
            .addOrderBy("analysis.likes", "DESC")
            .limit(10)
            .getMany();
    }

    res.json({
        timeframe,
        highlights: trendingHighlights,
        analyses: trendingAnalyses
    });
});

// Get comparison statistics
export const getComparisonStats = asyncHandler(async (req: Request, res: Response) => {
    const { userId, otherUserId } = req.query;

    if (!userId || !otherUserId) {
        return res.status(400).json({ error: "Both userId and otherUserId are required" });
    }

    const [user1, user2] = await Promise.all([
        userRepository.findOne({ where: { id: userId as string } }),
        userRepository.findOne({ where: { id: otherUserId as string } })
    ]);

    if (!user1 || !user2) {
        return res.status(404).json({ error: "One or both users not found" });
    }

    const [user1Stats, user2Stats] = await Promise.all([
        getUserStatistics(userId as string),
        getUserStatistics(otherUserId as string)
    ]);

    res.json({
        user1: {
            id: user1.id,
            name: user1.name,
            imgURL: user1.imgURL,
            ...user1Stats
        },
        user2: {
            id: user2.id,
            name: user2.name,
            imgURL: user2.imgURL,
            ...user2Stats
        }
    });
});

// Helper function to get user statistics
async function getUserStatistics(userId: string) {
    const userHighlights = await highlightRepository.count({
        where: { author: { id: userId } }
    });

    const userAnalyses = await tacticalRepository.count({
        where: { author: { id: userId } }
    });

    const highlightStats = await highlightRepository
        .createQueryBuilder("highlight")
        .select("SUM(highlight.views)", "totalViews")
        .addSelect("SUM(highlight.likes)", "totalLikes")
        .where("highlight.author.id = :userId", { userId })
        .getRawOne();

    const analysisStats = await tacticalRepository
        .createQueryBuilder("analysis")
        .select("SUM(analysis.views)", "totalViews")
        .addSelect("SUM(analysis.likes)", "totalLikes")
        .where("analysis.author.id = :userId", { userId })
        .getRawOne();

    const totalViews = (parseInt(highlightStats?.totalViews) || 0) + (parseInt(analysisStats?.totalViews) || 0);
    const totalLikes = (parseInt(highlightStats?.totalLikes) || 0) + (parseInt(analysisStats?.totalLikes) || 0);

    return {
        highlights: userHighlights,
        analyses: userAnalyses,
        totalViews,
        totalLikes
    };
}