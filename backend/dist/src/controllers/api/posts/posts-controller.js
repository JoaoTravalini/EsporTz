import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicPost } from "../utils/sanitizers.js";
import { createPost } from "../../../services/create-post.js";
import { createComment } from "../../../services/create-comment.js";
import { getPosts } from "../../../services/get-posts.js";
import { getPost } from "../../../services/get-post.js";
import { createRepost } from "../../../services/create-repost.js";
import { getUserPosts } from "../../../services/get-user-posts.js";
const router = Router();
router.get("/", asyncHandler(async (_req, res) => {
    const posts = await getPosts();
    return res.json({ posts: posts.map(toPublicPost) });
}));
router.post("/", asyncHandler(async (req, res) => {
    const { authorId, content, parentId, workoutActivityIds } = req.body ?? {};
    console.log('[POST /posts] Received request:', { authorId, contentLength: content?.length, parentId, workoutActivityIds });
    if (!authorId || !content) {
        console.log('[POST /posts] Missing required fields:', { authorId: !!authorId, content: !!content });
        return res.status(400).json({ message: "Missing required fields: authorId, content" });
    }
    // Validar workoutActivityIds se fornecido
    if (workoutActivityIds && (!Array.isArray(workoutActivityIds) || workoutActivityIds.length === 0)) {
        return res.status(400).json({ message: "workoutActivityIds must be a non-empty array" });
    }
    if (workoutActivityIds && workoutActivityIds.length > 10) {
        return res.status(400).json({ message: "Maximum 10 workout activities allowed per post" });
    }
    const post = await createPost({ authorId, content, parentId, workoutActivityIds });
    if (!post) {
        return res.status(404).json({ message: "Author or parent post not found" });
    }
    try {
        const publicPost = toPublicPost(post);
        return res.status(201).json({ post: publicPost });
    }
    catch (error) {
        console.error("Failed to serialize post response", {
            error,
            postId: post.id
        });
        throw error;
    }
}));
router.post("/:postId/comments", asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { authorId, content } = req.body ?? {};
    if (!postId) {
        return res.status(400).json({ message: "Missing postId parameter" });
    }
    if (!authorId || !content) {
        return res.status(400).json({ message: "Missing required fields: authorId, content" });
    }
    const comment = await createComment({ authorId, parentPostId: postId, content });
    if (!comment) {
        return res.status(404).json({ message: "Parent post or author not found" });
    }
    const parent = await getPost({ id: postId });
    return res.status(201).json({
        comment: toPublicPost(comment),
        post: parent ? toPublicPost(parent) : undefined
    });
}));
router.post("/:postId/repost", asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body ?? {};
    if (!postId || !userId) {
        return res.status(400).json({ message: "Missing required fields: postId, userId" });
    }
    const updatedPost = await createRepost({ userId, postId });
    if (!updatedPost) {
        return res.status(404).json({ message: "Post or user not found" });
    }
    return res.status(201).json({ post: toPublicPost(updatedPost) });
}));
router.get("/user/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "Missing userId parameter" });
    }
    const posts = await getUserPosts({ userId });
    return res.json({ posts: posts.map(toPublicPost) });
}));
router.get("/:postId", asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({ message: "Missing postId parameter" });
    }
    const post = await getPost({ id: postId });
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    return res.json({ post: toPublicPost(post) });
}));
export const postsRouter = router;
//# sourceMappingURL=posts-controller.js.map