import { Router } from "express";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicUser } from "../utils/sanitizers.js";
import { createUser } from "../../../services/create-user.js";
import { getUser } from "../../../services/get-user.js";
import { generateJwtToken } from "../../../services/jwt-service.js";
import { refreshStravaAccessToken, upsertStravaToken } from "../../../services/strava-token-service.js";
const router = Router();
router.post("/register", asyncHandler(async (req, res) => {
    const { email, password, name } = req.body ?? {};
    console.log("Registering user", { email, password, name });
    if (!email || !password || !name) {
        return res.status(400).json({ message: "Missing required fields: email, password, name" });
    }
    const existingUser = await getUser({ email });
    if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
    }
    const createdUser = await createUser({ email, password, name });
    if (!createdUser) {
        return res.status(500).json({ message: "Unable to create user" });
    }
    const token = generateJwtToken({ sub: createdUser.id });
    return res.status(201).json({
        user: toPublicUser(createdUser),
        token
    });
}));
router.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
        return res.status(400).json({ message: "Missing required fields: email, password" });
    }
    const user = await getUser({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateJwtToken({ sub: user.id });
    return res.json({
        user: toPublicUser(user),
        token
    });
}));
router.get("/callback", asyncHandler(async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Missing authorization code" });
    }
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_SECRET_CLIENT;
    if (!clientId || !clientSecret) {
        return res.status(500).json({ message: "Strava credentials are not configured" });
    }
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code"
    });
    const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    });
    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        console.error("Strava token exchange failed", errorPayload);
        return res.status(response.status).json(errorPayload);
    }
    const tokenPayload = await response.json();
    const { token } = await upsertStravaToken(tokenPayload);
    console.log("Strava token exchange success", {
        providerUserId: token.providerUserId,
        expiresAt: token.accessTokenExpiresAt
    });
    return res.json({
        tokens: tokenPayload,
        stored: {
            id: token.id,
            providerUserId: token.providerUserId,
            accessTokenExpiresAt: token.accessTokenExpiresAt
        }
    });
}));
router.post("/refresh", asyncHandler(async (req, res) => {
    const { athleteId } = req.body;
    if (!athleteId) {
        return res.status(400).json({ message: "Missing athleteId" });
    }
    const result = await refreshStravaAccessToken({ providerUserId: String(athleteId) });
    if (!result) {
        return res.status(404).json({ message: "Refresh token not found" });
    }
    return res.json({
        tokens: result.raw,
        stored: {
            id: result.token.id,
            providerUserId: result.token.providerUserId,
            accessTokenExpiresAt: result.token.accessTokenExpiresAt
        }
    });
}));
// Debug endpoint para verificar se um usuário existe pelo ID
router.get("/user/:userId", asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "Missing userId parameter" });
    }
    const user = await getUser({ id: userId });
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            userId
        });
    }
    return res.json({
        user: toPublicUser(user),
        exists: true
    });
}));
export const r = router;
//# sourceMappingURL=auth-controller.js.map