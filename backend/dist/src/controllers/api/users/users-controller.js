import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicUser, toPublicUserProfile } from "../utils/sanitizers.js";
import { createUser } from "../../../services/create-user.js";
import { getUser } from "../../../services/get-user.js";
import { getUserSuggestions } from "../../../services/get-user-suggestions.js";
import { updateUser, updateUserPreferences } from "../../../services/update-user.js";
import { createFollower } from "../../../services/create-follower.js";
import { deleteFollower } from "../../../services/delete-follower.js";
import { getFollower } from "../../../services/get-follower.js";
import { searchUsers } from "../../../services/mention-service.js";
import rateLimit from "express-rate-limit";
const router = Router();
// Rate limiter para busca de usuários (30 requisições por minuto)
const searchRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 requisições
    message: "Too many search requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false
});
// Search users for mentions autocomplete
router.get("/search", searchRateLimiter, asyncHandler(async (req, res) => {
    console.log('🔍 Search route hit with query:', req.query);
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Missing or invalid query parameter: q" });
    }
    if (q.length < 2) {
        return res.status(400).json({ message: "Query must be at least 2 characters" });
    }
    const users = await searchUsers(q, 10);
    return res.json({
        users: users.map(u => ({
            id: u.id,
            name: u.name,
            username: u.email.split('@')[0], // Extrair username do email
            avatar: u.imgURL
        }))
    });
}));
router.post("/", asyncHandler(async (req, res) => {
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
}));
router.get("/suggestions/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    if (!userId) {
        return res.status(400).json({ message: "Missing required parameter: userId" });
    }
    const suggestions = await getUserSuggestions({ userId, limit });
    return res.json({
        suggestions: suggestions.map(toPublicUser),
        count: suggestions.length
    });
}));
router.get("/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    // Validate UUID format to prevent catching 'search' or other non-UUID strings
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!userId || !uuidRegex.test(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }
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
}));
router.put("/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { name, bio, location, website, imgURL } = req.body ?? {};
    if (!userId) {
        return res.status(400).json({ message: "Missing required parameter: userId" });
    }
    // Validações
    if (name !== undefined && name.trim().length === 0) {
        return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (bio !== undefined && bio.length > 500) {
        return res.status(400).json({ message: "Bio cannot exceed 500 characters" });
    }
    if (location !== undefined && location.length > 100) {
        return res.status(400).json({ message: "Location cannot exceed 100 characters" });
    }
    if (website !== undefined && website.length > 0) {
        // Validação básica de URL
        try {
            new URL(website);
        }
        catch {
            return res.status(400).json({ message: "Invalid website URL" });
        }
    }
    const updatedUser = await updateUser({
        userId,
        name,
        bio,
        location,
        website,
        imgURL
    });
    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json({
        user: toPublicUserProfile(updatedUser),
        message: "Profile updated successfully"
    });
}));
// Follow a user
router.post("/:userId/follow", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { followerId } = req.body ?? {};
    if (!userId || !followerId) {
        return res.status(400).json({ message: "Missing required fields: userId, followerId" });
    }
    if (userId === followerId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
    }
    // Check if already following
    const alreadyFollowing = await getFollower({
        followerId,
        followedId: userId
    });
    if (alreadyFollowing) {
        return res.status(200).json({
            message: "Already following this user",
            following: true
        });
    }
    const success = await createFollower({
        followerId,
        followedId: userId
    });
    if (!success) {
        return res.status(400).json({ message: "Unable to follow user" });
    }
    return res.status(201).json({
        message: "Successfully followed user",
        following: true
    });
}));
// Unfollow a user
router.delete("/:userId/follow", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { followerId } = req.body ?? {};
    if (!userId || !followerId) {
        return res.status(400).json({ message: "Missing required fields: userId, followerId" });
    }
    if (userId === followerId) {
        return res.status(400).json({ message: "Cannot unfollow yourself" });
    }
    const success = await deleteFollower({
        followerId,
        followedId: userId
    });
    if (!success) {
        return res.status(400).json({ message: "Unable to unfollow user" });
    }
    return res.status(200).json({
        message: "Successfully unfollowed user",
        following: false
    });
}));
// Update user preferences
router.put("/:userId/preferences", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { preferences } = req.body ?? {};
    if (!userId) {
        return res.status(400).json({ message: "Missing required parameter: userId" });
    }
    if (!preferences) {
        return res.status(400).json({ message: "Missing preferences data" });
    }
    // Validações
    if (preferences.favoriteSports !== undefined) {
        if (!Array.isArray(preferences.favoriteSports)) {
            return res.status(400).json({ message: "favoriteSports must be an array" });
        }
        // Validar que todos os itens são strings
        if (!preferences.favoriteSports.every((sport) => typeof sport === 'string')) {
            return res.status(400).json({ message: "All favorite sports must be strings" });
        }
    }
    if (preferences.notifications !== undefined) {
        if (typeof preferences.notifications !== 'object') {
            return res.status(400).json({ message: "notifications must be an object" });
        }
        // Validar estrutura de notifications
        const validNotificationKeys = ['highlights', 'analyses', 'matches', 'followedTeams'];
        const notificationKeys = Object.keys(preferences.notifications);
        const invalidKeys = notificationKeys.filter(key => !validNotificationKeys.includes(key));
        if (invalidKeys.length > 0) {
            return res.status(400).json({ message: `Invalid notification keys: ${invalidKeys.join(', ')}` });
        }
        // Validar que todos os valores são booleanos
        if (!Object.values(preferences.notifications).every(val => typeof val === 'boolean')) {
            return res.status(400).json({ message: "All notification values must be boolean" });
        }
    }
    if (preferences.privacy !== undefined) {
        if (typeof preferences.privacy !== 'object') {
            return res.status(400).json({ message: "privacy must be an object" });
        }
        // Validar estrutura de privacy
        const validPrivacyKeys = ['profilePublic', 'showStats', 'allowAnalysisSharing'];
        const privacyKeys = Object.keys(preferences.privacy);
        const invalidKeys = privacyKeys.filter(key => !validPrivacyKeys.includes(key));
        if (invalidKeys.length > 0) {
            return res.status(400).json({ message: `Invalid privacy keys: ${invalidKeys.join(', ')}` });
        }
        // Validar que todos os valores são booleanos
        if (!Object.values(preferences.privacy).every(val => typeof val === 'boolean')) {
            return res.status(400).json({ message: "All privacy values must be boolean" });
        }
    }
    const updatedUser = await updateUserPreferences({
        userId,
        preferences
    });
    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json({
        user: toPublicUserProfile(updatedUser),
        message: "Preferences updated successfully"
    });
}));
export const usersRouter = router;
//# sourceMappingURL=users-controller.js.map