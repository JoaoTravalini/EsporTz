import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { createFollower } from "../../../services/create-follower.js";
import { getFollower } from "../../../services/get-follower.js";
const router = Router();
router.post("/", asyncHandler(async (req, res) => {
    const { followerId, followedId } = req.body ?? {};
    if (!followerId || !followedId) {
        return res.status(400).json({ message: "Missing required fields: followerId, followedId" });
    }
    if (followerId === followedId) {
        return res.status(400).json({ message: "Follower and followed cannot be the same user" });
    }
    const alreadyFollowing = await getFollower({ followerId, followedId });
    if (alreadyFollowing) {
        return res.status(200).json({ message: "Users are already linked" });
    }
    const created = await createFollower({ followerId, followedId });
    if (!created) {
        return res.status(400).json({ message: "Unable to create follow relationship" });
    }
    return res.status(201).json({ message: "Follow relationship established" });
}));
export const followersRouter = router;
//# sourceMappingURL=followers-controller.js.map