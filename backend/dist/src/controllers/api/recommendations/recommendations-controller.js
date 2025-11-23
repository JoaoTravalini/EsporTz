import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicPost, toPublicUser } from "../utils/sanitizers.js";
import { recommendPosts, recommendUsers } from "../../../services/recommendation-service.js";
import { getTrendingHashtags } from "../../../services/trending-service.js";
const router = Router();
/**
 * GET /api/recommendations/posts?limit=10
 * Recomenda posts para o usuário autenticado
 */
router.get("/posts", asyncHandler(async (req, res) => {
    // TODO: Pegar userId do token de autenticação
    const userId = req.query.userId;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    if (!userId) {
        return res.status(400).json({
            message: "Missing userId. Authentication required."
        });
    }
    const recommendations = await recommendPosts(userId, limit);
    return res.json({
        recommendations: recommendations.map(rec => ({
            post: toPublicPost(rec.post),
            score: rec.score,
            reasons: rec.reasons
        })),
        count: recommendations.length
    });
}));
/**
 * GET /api/recommendations/users?limit=5
 * Recomenda usuários para seguir
 */
router.get("/users", asyncHandler(async (req, res) => {
    // TODO: Pegar userId do token de autenticação
    const userId = req.query.userId;
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    if (!userId) {
        return res.status(400).json({
            message: "Missing userId. Authentication required."
        });
    }
    const recommendations = await recommendUsers(userId, limit);
    return res.json({
        recommendations: recommendations.map(rec => ({
            user: toPublicUser(rec.user),
            score: rec.score,
            reasons: rec.reasons,
            sharedHashtags: rec.sharedHashtags
        })),
        count: recommendations.length
    });
}));
/**
 * GET /api/recommendations/trending?window=24h&limit=10
 * Retorna hashtags em alta
 */
router.get("/trending", asyncHandler(async (req, res) => {
    const timeWindow = req.query.window || '24h';
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    // Valida time window
    if (!['1h', '24h', '7d'].includes(timeWindow)) {
        return res.status(400).json({
            message: "Invalid time window. Must be one of: 1h, 24h, 7d"
        });
    }
    const trending = await getTrendingHashtags(timeWindow, limit);
    return res.json({
        trending,
        timeWindow,
        count: trending.length
    });
}));
export const recommendationsRouter = router;
//# sourceMappingURL=recommendations-controller.js.map