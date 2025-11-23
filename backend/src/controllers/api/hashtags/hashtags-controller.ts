import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicPost } from "../utils/sanitizers.js";
import { searchHashtags, getPostsByHashtag } from "../../../services/hashtag-service.js";
import { getTrendingHashtags } from "../../../services/trending-service.js";

const router: ExpressRouter = Router();

/**
 * GET /api/hashtags/search?q=fitness&limit=10
 * Busca hashtags por padrão
 */
router.get(
    "/search",
    asyncHandler(async (req, res) => {
        const query = (req.query.q as string) || "";
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

        if (query.length > 50) {
            return res.status(400).json({ 
                message: "Query too long. Maximum 50 characters." 
            });
        }

        const hashtags = await searchHashtags(query, limit);

        return res.json({ 
            hashtags: hashtags.map(h => ({
                id: h.id,
                tag: h.tag,
                displayTag: h.displayTag,
                postCount: h.postCount,
                lastUsedAt: h.lastUsedAt
            }))
        });
    })
);

/**
 * GET /api/hashtags/:tag/posts?limit=20&offset=0
 * Lista posts de uma hashtag
 */
router.get(
    "/:tag/posts",
    asyncHandler(async (req, res) => {
        const { tag } = req.params;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

        if (!tag) {
            return res.status(400).json({ message: "Missing tag parameter" });
        }

        if (tag.length > 50) {
            return res.status(400).json({ 
                message: "Tag too long. Maximum 50 characters." 
            });
        }

        const posts = await getPostsByHashtag(tag, limit, offset);

        return res.json({ 
            tag,
            posts: posts.map(toPublicPost),
            count: posts.length,
            limit,
            offset
        });
    })
);

/**
 * GET /api/hashtags/trending?window=24h&limit=10
 * Retorna hashtags em alta
 */
router.get(
    "/trending",
    asyncHandler(async (req, res) => {
        const timeWindow = (req.query.window as '1h' | '24h' | '7d') || '24h';
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

        // Valida time window
        if (!['1h', '24h', '7d', '30d'].includes(timeWindow)) {
            return res.status(400).json({ 
                message: "Invalid time window. Must be one of: 1h, 24h, 7d, 30d" 
            });
        }

        const trending = await getTrendingHashtags(timeWindow, limit);

        return res.json({
            trending,
            timeWindow,
            count: trending.length
        });
    })
);

export const hashtagsRouter = router;
