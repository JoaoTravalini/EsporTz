import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicUser, toPublicUserProfile } from "../utils/sanitizers.js";
import { createUser } from "../../../services/create-user.js";
import { getUser } from "../../../services/get-user.js";
import { getUserSuggestions } from "../../../services/get-user-suggestions.js";

const router: ExpressRouter = Router();

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const { email, password, name, provider, imgURL } = req.body ?? {};

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Missing required fields: email, password, name" });
        }

        const existingUser = await getUser({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists", user: toPublicUser(existingUser) });
        }

        const createdUser = await createUser({ email, password, name, provider, imgURL });

        if (!createdUser) {
            return res.status(500).json({ message: "Unable to create user" });
        }

        return res.status(201).json({ user: toPublicUser(createdUser) });
    })
);

router.get(
    "/suggestions/:userId",
    asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

        if (!userId) {
            return res.status(400).json({ message: "Missing required parameter: userId" });
        }

        const suggestions = await getUserSuggestions({ userId, limit });

        return res.json({
            suggestions: suggestions.map(toPublicUser),
            count: suggestions.length
        });
    })
);

router.get(
    "/:userId",
    asyncHandler(async (req, res) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "Missing required parameter: userId" });
        }

        const user = await getUser({
            id: userId,
            relations: ['highlights', 'tacticalAnalyses', 'favoriteTeams', 'followers', 'following']
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ user: toPublicUserProfile(user) });
    })
);

export const usersRouter = router;
