import { asyncHandler } from "../utils/async-handler.js";
import { AppDataSource } from "../../../database/postgres/data-source.js";
import { TacticalAnalysis } from "../../../database/postgres/entities/TacticalAnalysis.js";
import { TacticalComment } from "../../../database/postgres/entities/TacticalComment.js";
import { User } from "../../../database/postgres/entities/user-entity.js";
import { Sport } from "../../../database/postgres/entities/Sport.js";
import { Highlight } from "../../../database/postgres/entities/Highlight.js";
import { Match } from "../../../database/postgres/entities/Match.js";
import { validateTacticalAnalysis } from "./validators.js";
import { generateAIInsights } from "../../../services/ai-analysis.js";
const tacticalRepository = AppDataSource.getRepository(TacticalAnalysis);
const commentRepository = AppDataSource.getRepository(TacticalComment);
const userRepository = AppDataSource.getRepository(User);
const sportRepository = AppDataSource.getRepository(Sport);
const highlightRepository = AppDataSource.getRepository(Highlight);
const matchRepository = AppDataSource.getRepository(Match);
// Get all tactical analyses
export const getTacticalAnalyses = asyncHandler(async (req, res) => {
    const { sport, author, featured, limit = 20, offset = 0, sortBy = 'createdAt', order = 'DESC' } = req.query;
    const queryBuilder = tacticalRepository
        .createQueryBuilder("analysis")
        .leftJoinAndSelect("analysis.author", "author")
        .leftJoinAndSelect("analysis.sport", "sport")
        .leftJoinAndSelect("analysis.highlight", "highlight")
        .leftJoinAndSelect("analysis.match", "match")
        .leftJoinAndSelect("analysis.likedBy", "likedBy")
        .where("analysis.isPublic = :isPublic", { isPublic: true });
    if (sport) {
        queryBuilder.andWhere("sport.name = :sport", { sport });
    }
    if (author) {
        queryBuilder.andWhere("author.id = :author", { author });
    }
    if (featured === 'true') {
        queryBuilder.andWhere("analysis.isVerified = :isVerified", { isVerified: true });
    }
    queryBuilder
        .orderBy(`analysis.${sortBy}`, order)
        .limit(Number(limit))
        .offset(Number(offset));
    const [analyses, total] = await queryBuilder.getManyAndCount();
    res.json({
        analyses,
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total
    });
});
// Get single tactical analysis by ID
export const getTacticalAnalysisById = asyncHandler(async (req, res) => {
    const analysisId = req.params.id;
    if (!analysisId) {
        return res.status(400).json({ error: "Invalid analysis ID" });
    }
    const analysis = await tacticalRepository
        .createQueryBuilder("analysis")
        .leftJoinAndSelect("analysis.author", "author")
        .leftJoinAndSelect("analysis.sport", "sport")
        .leftJoinAndSelect("analysis.highlight", "highlight")
        .leftJoinAndSelect("analysis.match", "match")
        .leftJoinAndSelect("analysis.comments", "comments")
        .leftJoinAndSelect("comments.author", "commentAuthor")
        .leftJoinAndSelect("analysis.likedBy", "likedBy")
        .where("analysis.id = :id", { id: analysisId })
        .getOne();
    if (!analysis) {
        return res.status(404).json({ error: "Tactical analysis not found" });
    }
    // Increment view count
    if (analysisId) {
        await tacticalRepository.increment({ id: analysisId }, "views", 1);
    }
    res.json(analysis);
});
// Create new tactical analysis
export const createTacticalAnalysis = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const validation = validateTacticalAnalysis(req.body);
    if (!validation.success) {
        res.status(400).json({ error: validation.error });
        return;
    }
    const { title, content, sportId, formation, tacticalPatterns, keyMoments, highlightId, matchId, statistics, isPublic = true } = validation.data;
    const user = await userRepository.findOne({ where: { id: userId } });
    const sport = await sportRepository.findOne({ where: { id: sportId } });
    if (!user || !sport) {
        return res.status(404).json({ error: "User or sport not found" });
    }
    let highlight = null;
    let match = null;
    if (highlightId) {
        highlight = await highlightRepository.findOne({ where: { id: highlightId } });
        if (!highlight) {
            return res.status(404).json({ error: "Highlight not found" });
        }
    }
    if (matchId) {
        match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }
    }
    // Generate AI insights if requested
    let aiInsights;
    try {
        aiInsights = await generateAIInsights({
            sport: sport.name,
            content,
            formation,
            tacticalPatterns,
            statistics
        });
    }
    catch (error) {
        console.error("Error generating AI insights:", error);
        // Continue without AI insights if it fails
    }
    const analysisData = {
        title,
        content,
        author: user,
        sport,
        isPublic
    };
    if (formation)
        analysisData.formation = formation;
    if (tacticalPatterns)
        analysisData.tacticalPatterns = tacticalPatterns;
    if (keyMoments)
        analysisData.keyMoments = keyMoments;
    if (statistics)
        analysisData.statistics = statistics;
    if (aiInsights)
        analysisData.aiInsights = aiInsights;
    if (highlight)
        analysisData.highlight = highlight;
    if (match)
        analysisData.match = match;
    const analysis = tacticalRepository.create(analysisData);
    const savedAnalysis = await tacticalRepository.save(analysis);
    // Update user stats
    await userRepository.increment({ id: userId }, "stats.analysesCreated", 1);
    res.status(201).json(savedAnalysis);
});
// Update tactical analysis
export const updateTacticalAnalysis = asyncHandler(async (req, res) => {
    const analysisId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!analysisId) {
        return res.status(400).json({ error: "Invalid analysis ID" });
    }
    const analysis = await tacticalRepository.findOne({
        where: { id: analysisId },
        relations: ["author"]
    });
    if (!analysis) {
        return res.status(404).json({ error: "Tactical analysis not found" });
    }
    if (analysis.author.id !== userId) {
        return res.status(403).json({ error: "Not authorized to update this analysis" });
    }
    const validation = validateTacticalAnalysis(req.body);
    if (!validation.success) {
        res.status(400).json({ error: validation.error });
        return;
    }
    const { title, content, formation, tacticalPatterns, keyMoments, statistics, isPublic } = validation.data;
    Object.assign(analysis, {
        title,
        content,
        formation,
        tacticalPatterns,
        keyMoments,
        statistics,
        isPublic
    });
    const updatedAnalysis = await tacticalRepository.save(analysis);
    res.json(updatedAnalysis);
});
// Delete tactical analysis
export const deleteTacticalAnalysis = asyncHandler(async (req, res) => {
    const analysisId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!analysisId) {
        return res.status(400).json({ error: "Invalid analysis ID" });
    }
    const analysis = await tacticalRepository.findOne({
        where: { id: analysisId },
        relations: ["author"]
    });
    if (!analysis) {
        return res.status(404).json({ error: "Tactical analysis not found" });
    }
    if (analysis.author.id !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this analysis" });
    }
    await tacticalRepository.delete(analysisId);
    res.status(204).send();
});
// Like/unlike tactical analysis
export const toggleLikeAnalysis = asyncHandler(async (req, res) => {
    const analysisId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!analysisId) {
        return res.status(400).json({ error: "Invalid analysis ID" });
    }
    const analysis = await tacticalRepository.findOne({
        where: { id: analysisId },
        relations: ["likedBy", "author"]
    });
    if (!analysis) {
        return res.status(404).json({ error: "Tactical analysis not found" });
    }
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const isLiked = analysis.likedBy.some(likedUser => likedUser.id === userId);
    if (isLiked) {
        // Unlike
        analysis.likedBy = analysis.likedBy.filter(likedUser => likedUser.id !== userId);
        analysis.likes = Math.max(0, analysis.likes - 1);
    }
    else {
        // Like
        analysis.likedBy.push(user);
        analysis.likes += 1;
    }
    await tacticalRepository.save(analysis);
    res.json({
        liked: !isLiked,
        likes: analysis.likes
    });
});
// Add comment to tactical analysis
export const addComment = asyncHandler(async (req, res) => {
    const analysisId = req.params.id;
    const userId = req.user?.id;
    const { content, timestamp, drawingData, parentCommentId } = req.body;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Comment content is required" });
    }
    if (!analysisId) {
        return res.status(400).json({ error: "Invalid analysis ID" });
    }
    const analysis = await tacticalRepository.findOne({ where: { id: analysisId } });
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!analysis || !user) {
        return res.status(404).json({ error: "Analysis or user not found" });
    }
    let parentComment = null;
    if (parentCommentId) {
        parentComment = await commentRepository.findOne({ where: { id: parentCommentId } });
        if (!parentComment) {
            return res.status(404).json({ error: "Parent comment not found" });
        }
    }
    const commentData = {
        content: content.trim(),
        timestamp,
        drawingData,
        author: user,
        analysis
    };
    if (parentComment) {
        commentData.parent = parentComment;
    }
    const comment = commentRepository.create(commentData);
    const savedComment = await commentRepository.save(comment);
    res.status(201).json(savedComment);
});
// Get comments for tactical analysis
export const getComments = asyncHandler(async (req, res) => {
    const analysisId = req.params.id;
    const { limit = 50, offset = 0 } = req.query;
    if (!analysisId) {
        return res.status(400).json({ error: "Invalid analysis ID" });
    }
    const comments = await commentRepository
        .createQueryBuilder("comment")
        .leftJoinAndSelect("comment.author", "author")
        .leftJoinAndSelect("comment.parent", "parent")
        .where("comment.analysis.id = :id", { id: analysisId })
        .orderBy("comment.createdAt", "ASC")
        .limit(Number(limit))
        .offset(Number(offset))
        .getMany();
    res.json(comments);
});
// Get user's tactical analyses
export const getUserTacticalAnalyses = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const analyses = await tacticalRepository
        .createQueryBuilder("analysis")
        .leftJoinAndSelect("analysis.sport", "sport")
        .leftJoinAndSelect("analysis.highlight", "highlight")
        .leftJoinAndSelect("analysis.match", "match")
        .leftJoinAndSelect("analysis.likedBy", "likedBy")
        .where("analysis.author.id = :userId", { userId })
        .orderBy("analysis.createdAt", "DESC")
        .limit(Number(limit))
        .offset(Number(offset))
        .getMany();
    res.json(analyses);
});
// Search tactical analyses
export const searchTacticalAnalyses = asyncHandler(async (req, res) => {
    const { q, sport, limit = 20, offset = 0 } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
    }
    const queryBuilder = tacticalRepository
        .createQueryBuilder("analysis")
        .leftJoinAndSelect("analysis.author", "author")
        .leftJoinAndSelect("analysis.sport", "sport")
        .leftJoinAndSelect("analysis.likedBy", "likedBy")
        .where("analysis.isPublic = :isPublic", { isPublic: true })
        .andWhere("(LOWER(analysis.title) LIKE LOWER(:query) OR LOWER(analysis.content) LIKE LOWER(:query))", { query: `%${q}%` });
    if (sport) {
        queryBuilder.andWhere("sport.name = :sport", { sport });
    }
    const [analyses, total] = await queryBuilder
        .orderBy("analysis.createdAt", "DESC")
        .limit(Number(limit))
        .offset(Number(offset))
        .getManyAndCount();
    res.json({
        analyses,
        total,
        query: q,
        hasMore: Number(offset) + Number(limit) < total
    });
});
//# sourceMappingURL=tactical-analysis-controller.js.map