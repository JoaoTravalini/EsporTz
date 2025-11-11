import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicLike, toPublicPost } from "../utils/sanitizers.js";
import { createLike } from "../../../services/create-like.js";
import { getPost } from "../../../services/get-post.js";

const router: ExpressRouter = Router();

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const { userId, postId } = req.body ?? {};

        if (!userId || !postId) {
            return res.status(400).json({ message: "Missing required fields: userId, postId" });
        }

        const like = await createLike({ userId, postId });

        if (!like) {
            return res.status(404).json({ message: "User or post not found" });
        }

        const post = await getPost({ id: postId });

        return res.status(201).json({
            like: toPublicLike(like),
            post: post ? toPublicPost(post) : undefined
        });
    })
);

export const likesRouter = router;
