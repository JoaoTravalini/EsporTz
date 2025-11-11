import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { AppDataSource } from "../../../database/postgres/data-source.js";
import { Highlight } from "../../../database/postgres/entities/Highlight.js";
import { User } from "../../../database/postgres/entities/user-entity.js";
import { Sport } from "../../../database/postgres/entities/Sport.js";
import { Like } from "../../../database/postgres/entities/like-entity.js";
import { validateHighlight } from "./validators.js";
import { uploadMedia } from "../../../services/media-upload.js";

type AuthenticatedRequest = Request & {
    user?: {
        id: string;
        email: string;
    };
};

const highlightRepository = AppDataSource.getRepository(Highlight);
const userRepository = AppDataSource.getRepository(User);
const sportRepository = AppDataSource.getRepository(Sport);
const likeRepository = AppDataSource.getRepository(Like);

// Get all highlights with filtering
export const getHighlights = asyncHandler(async (req: Request, res: Response) => {
    const {
        sport,
        featured,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        order = 'DESC'
    } = req.query;

    const queryBuilder = highlightRepository
        .createQueryBuilder("highlight")
        .leftJoinAndSelect("highlight.author", "author")
        .leftJoinAndSelect("highlight.sport", "sport")
        .leftJoinAndSelect("highlight.likedBy", "likedBy")
        .where("highlight.isPublic = :isPublic", { isPublic: true });

    if (sport) {
        queryBuilder.andWhere("sport.name = :sport", { sport });
    }

    if (featured === 'true') {
        queryBuilder.andWhere("highlight.isFeatured = :isFeatured", { isFeatured: true });
    }

    queryBuilder
        .orderBy(`highlight.${sortBy as string}`, order as 'ASC' | 'DESC')
        .limit(Number(limit))
        .offset(Number(offset));

    const [highlights, total] = await queryBuilder.getManyAndCount();

    res.json({
        highlights,
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total
    });
});

// Get single highlight by ID
export const getHighlightById = asyncHandler(async (req: Request, res: Response) => {
    const highlightId = req.params.id;

    if (!highlightId) {
        return res.status(400).json({ error: "Invalid highlight ID" });
    }

    const highlight = await highlightRepository
        .createQueryBuilder("highlight")
        .leftJoinAndSelect("highlight.author", "author")
        .leftJoinAndSelect("highlight.sport", "sport")
        .leftJoinAndSelect("highlight.likedBy", "likedBy")
        .leftJoinAndSelect("highlight.relatedPosts", "relatedPosts")
        .leftJoinAndSelect("relatedPosts.author", "postAuthor")
    .where("highlight.id = :id", { id: highlightId })
        .getOne();

    if (!highlight) {
        return res.status(404).json({ error: "Highlight not found" });
    }

    // Increment view count
    if (highlightId) {
        await highlightRepository.increment({ id: highlightId }, "views", 1);
    }

    res.json(highlight);
});

// Create new highlight
export const createHighlight = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const validation = validateHighlight(req.body);
    if (!validation.success) {
        res.status(400).json({ error: validation.error });
        return;
    }

    const { title, description, sportId, tags, metadata, isPublic = true } = validation.data;

    const user = await userRepository.findOne({ where: { id: userId } });
    const sport = await sportRepository.findOne({ where: { id: sportId } });

    if (!user || !sport) {
        return res.status(404).json({ error: "User or sport not found" });
    }

    let videoUrl: string | undefined;
    let imageUrl: string | undefined;
    let thumbnailUrl: string | undefined;

    // Handle media uploads if files are provided
    if (req.files) {
        const files = req.files as Record<string, Express.Multer.File[]>;

        if (files.video?.[0]) {
            const videoUpload = await uploadMedia(files.video[0], 'video');
            videoUrl = videoUpload.url;
            thumbnailUrl = videoUpload.thumbnail;
        }

        if (files.image?.[0]) {
            const imageUpload = await uploadMedia(files.image[0], 'image');
            imageUrl = imageUpload.url;
        }
    }

    const highlight = highlightRepository.create({
        title,
        description,
        videoUrl: videoUrl || '',
        imageUrl: imageUrl || '',
        thumbnailUrl: thumbnailUrl || '',
        author: user,
        sport,
        tags: tags || [],
        metadata: metadata || {},
        isPublic,
        duration: req.body.duration || 0
    });

    const savedHighlight = await highlightRepository.save(highlight);

    // Update user stats without relying on JSON column increments
    const currentStats = user.stats ?? {
        highlightsCreated: 0,
        analysesCreated: 0,
        totalViews: 0,
        totalLikes: 0,
        favoriteSport: undefined
    };

    const updatedStats = {
        ...currentStats,
        highlightsCreated: (currentStats.highlightsCreated ?? 0) + 1
    };

    await userRepository.update({ id: userId }, { stats: updatedStats });

    res.status(201).json(savedHighlight);
});

// Update highlight
export const updateHighlight = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const highlightId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!highlightId) {
        return res.status(400).json({ error: "Invalid highlight ID" });
    }

    const highlight = await highlightRepository.findOne({
        where: { id: highlightId },
        relations: ["author"]
    });

    if (!highlight) {
        return res.status(404).json({ error: "Highlight not found" });
    }

    if (highlight.author.id !== userId) {
        return res.status(403).json({ error: "Not authorized to update this highlight" });
    }

    const validation = validateHighlight(req.body);
    if (!validation.success) {
        res.status(400).json({ error: validation.error });
        return;
    }

    const { title, description, tags, metadata, isPublic, isFeatured } = validation.data;

    Object.assign(highlight, {
        title,
        description,
        tags,
        metadata,
        isPublic,
        isFeatured
    });

    const updatedHighlight = await highlightRepository.save(highlight);
    res.json(updatedHighlight);
});

// Delete highlight
export const deleteHighlight = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const highlightId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!highlightId) {
        return res.status(400).json({ error: "Invalid highlight ID" });
    }

    const highlight = await highlightRepository.findOne({
        where: { id: highlightId },
        relations: ["author"]
    });

    if (!highlight) {
        return res.status(404).json({ error: "Highlight not found" });
    }

    if (highlight.author.id !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this highlight" });
    }

    await highlightRepository.delete(highlightId);
    res.status(204).send();
});

// Like/unlike highlight
export const toggleLikeHighlight = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const highlightId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!highlightId) {
        return res.status(400).json({ error: "Invalid highlight ID" });
    }

    const highlight = await highlightRepository.findOne({
        where: { id: highlightId },
        relations: ["likedBy", "author"]
    });

    if (!highlight) {
        return res.status(404).json({ error: "Highlight not found" });
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const isLiked = highlight.likedBy.some(likedUser => likedUser.id === userId);

    if (isLiked) {
        // Unlike
        highlight.likedBy = highlight.likedBy.filter(likedUser => likedUser.id !== userId);
        highlight.likes = Math.max(0, highlight.likes - 1);
    } else {
        // Like
        highlight.likedBy.push(user);
        highlight.likes += 1;
    }

    await highlightRepository.save(highlight);

    res.json({
        liked: !isLiked,
        likes: highlight.likes
    });
});

// Get user's highlights
export const getUserHighlights = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const highlights = await highlightRepository
        .createQueryBuilder("highlight")
        .leftJoinAndSelect("highlight.sport", "sport")
        .leftJoinAndSelect("highlight.likedBy", "likedBy")
        .where("highlight.author.id = :userId", { userId })
        .orderBy("highlight.createdAt", "DESC")
        .limit(Number(limit))
        .offset(Number(offset))
        .getMany();

    res.json(highlights);
});

// Get featured highlights
export const getFeaturedHighlights = asyncHandler(async (req: Request, res: Response) => {
    const { sport, limit = 10 } = req.query;

    const queryBuilder = highlightRepository
        .createQueryBuilder("highlight")
        .leftJoinAndSelect("highlight.author", "author")
        .leftJoinAndSelect("highlight.sport", "sport")
        .where("highlight.isFeatured = :isFeatured", { isFeatured: true })
        .andWhere("highlight.isPublic = :isPublic", { isPublic: true });

    if (sport) {
        queryBuilder.andWhere("sport.name = :sport", { sport });
    }

    queryBuilder
        .orderBy("highlight.views", "DESC")
        .addOrderBy("highlight.likes", "DESC")
        .limit(Number(limit));

    const highlights = await queryBuilder.getMany();

    res.json(highlights);
});

// Search highlights
export const searchHighlights = asyncHandler(async (req: Request, res: Response) => {
    const { q, sport, limit = 20, offset = 0 } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
    }

    const queryBuilder = highlightRepository
        .createQueryBuilder("highlight")
        .leftJoinAndSelect("highlight.author", "author")
        .leftJoinAndSelect("highlight.sport", "sport")
        .leftJoinAndSelect("highlight.likedBy", "likedBy")
        .where("highlight.isPublic = :isPublic", { isPublic: true })
        .andWhere(
            "(LOWER(highlight.title) LIKE LOWER(:query) OR LOWER(highlight.description) LIKE LOWER(:query))",
            { query: `%${q}%` }
        );

    if (sport) {
        queryBuilder.andWhere("sport.name = :sport", { sport });
    }

    const [highlights, total] = await queryBuilder
        .orderBy("highlight.createdAt", "DESC")
        .limit(Number(limit))
        .offset(Number(offset))
        .getManyAndCount();

    res.json({
        highlights,
        total,
        query: q,
        hasMore: Number(offset) + Number(limit) < total
    });
});