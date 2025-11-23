import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { getPostMentions, getUserMentions } from "../../../services/mention-service.js";
const router = Router();
// Get mentions in a post
router.get("/post/:postId", asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({ message: "Missing required parameter: postId" });
    }
    const mentions = await getPostMentions(postId);
    return res.json({
        mentions: mentions.map(m => ({
            id: m.id,
            user: {
                id: m.mentionedUser.id,
                name: m.mentionedUser.name,
                username: m.mentionedUser.email.split('@')[0],
                avatar: m.mentionedUser.imgURL
            },
            position: m.position,
            context: m.context,
            createdAt: m.createdAt
        })),
        count: mentions.length
    });
}));
// Get posts where a user was mentioned
router.get("/user/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    if (!userId) {
        return res.status(400).json({ message: "Missing required parameter: userId" });
    }
    if (page < 1) {
        return res.status(400).json({ message: "Page must be greater than 0" });
    }
    if (limit < 1 || limit > 100) {
        return res.status(400).json({ message: "Limit must be between 1 and 100" });
    }
    const { mentions, total } = await getUserMentions(userId, page, limit);
    return res.json({
        mentions: mentions.map(m => ({
            id: m.id,
            post: {
                id: m.post.id,
                content: m.post.content,
                author: {
                    id: m.post.author.id,
                    name: m.post.author.name,
                    username: m.post.author.email.split('@')[0],
                    avatar: m.post.author.imgURL
                },
                createdAt: m.post.createdAt
            },
            context: m.context,
            createdAt: m.createdAt
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
}));
export const mentionsRouter = router;
//# sourceMappingURL=mentions-controller.js.map