import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { getAthleteStravaActivities, syncAthleteActivities, getUserActivities, getActivityById, getActivitiesByIds } from "../../../services/strava-activities-service.js";
import { verifyJwtToken } from "../../../services/jwt-service.js";
import { getUser } from "../../../services/get-user.js";
const router = Router();
// Middleware para autenticação em todas as rotas
router.use(asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Missing or invalid authorization header" });
    }
    const token = authHeader.substring(7);
    const payload = verifyJwtToken(token);
    if (!payload?.sub) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
    const user = await getUser({ id: payload.sub });
    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
}));
// Sincronizar atividades do Strava
router.post("/sync", asyncHandler(async (req, res) => {
    const user = req.user;
    const { limit = 50 } = req.body;
    // Aqui precisamos obter o athleteId do Strava do usuário
    // Por enquanto, vamos supor que temos uma forma de obter isso
    // TODO: Implementar relacionamento entre User e RefreshToken
    // Por enquanto, vamos buscar o último token Strava para descobrir o athleteId
    // Isso deve ser melhorado no futuro com um relacionamento direto
    const { RefreshToken } = await import("../../../database/postgres/entities/refresh-token.js");
    const { AppDataSource } = await import("../../../database/postgres/data-source.js");
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    const stravaTokens = await refreshTokenRepository.find({
        where: { provider: "strava" },
        order: { createdAt: 'DESC' },
        take: 1
    });
    const [latestToken] = stravaTokens;
    if (!latestToken?.providerUserId) {
        return res.status(400).json({
            message: "No Strava connection found. Please connect your Strava account first."
        });
    }
    const athleteId = latestToken.providerUserId;
    try {
        const syncedActivities = await syncAthleteActivities(athleteId, user.id, limit);
        return res.json({
            message: `Successfully synced ${syncedActivities.length} activities`,
            activities: syncedActivities
        });
    }
    catch (error) {
        console.error("Error syncing Strava activities:", error);
        return res.status(500).json({
            message: "Failed to sync Strava activities",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}));
// Buscar atividades sincronizadas do usuário
router.get("/my-activities", asyncHandler(async (req, res) => {
    const user = req.user;
    const { limit = 10, offset = 0 } = req.query;
    const activities = await getUserActivities(user.id, Number(limit), Number(offset));
    // Contar total para paginação
    const { WorkoutActivity } = await import("../../../database/postgres/entities/workout-activity.js");
    const { AppDataSource } = await import("../../../database/postgres/data-source.js");
    const workoutActivityRepository = AppDataSource.getRepository(WorkoutActivity);
    const total = await workoutActivityRepository.count({
        where: { userId: user.id }
    });
    return res.json({
        activities,
        pagination: {
            limit: Number(limit),
            offset: Number(offset),
            total,
            hasMore: Number(offset) + activities.length < total
        }
    });
}));
// Buscar atividade específica por ID
router.get("/activities/:activityId", asyncHandler(async (req, res) => {
    const { activityId } = req.params;
    if (!activityId) {
        return res.status(400).json({ message: "Missing activity ID" });
    }
    const activity = await getActivityById(activityId);
    if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
    }
    // Verificar se o usuário tem permissão para ver esta atividade
    if (activity.userId && activity.userId !== req.user.id && activity.isPrivate) {
        return res.status(403).json({ message: "Access denied to private activity" });
    }
    return res.json(activity);
}));
// Buscar múltiplas atividades por IDs (para seleção em posts)
router.post("/activities/batch", asyncHandler(async (req, res) => {
    const { activityIds } = req.body;
    if (!Array.isArray(activityIds) || activityIds.length === 0) {
        return res.status(400).json({ message: "Invalid activity IDs" });
    }
    if (activityIds.length > 10) {
        return res.status(400).json({ message: "Maximum 10 activities allowed per request" });
    }
    const activities = await getActivitiesByIds(activityIds);
    // Filtrar apenas atividades do usuário ou públicas
    const filteredActivities = activities.filter(activity => !activity.userId ||
        activity.userId === req.user.id ||
        !activity.isPrivate);
    return res.json({
        activities: filteredActivities,
        total: filteredActivities.length
    });
}));
// Buscar atividades diretamente da API Strava (sem sincronizar)
router.get("/strava-activities", asyncHandler(async (req, res) => {
    const { page = 1, perPage = 30, before, after } = req.query;
    // Similar ao endpoint de sync, precisamos obter o athleteId
    const { RefreshToken } = await import("../../../database/postgres/entities/refresh-token.js");
    const { AppDataSource } = await import("../../../database/postgres/data-source.js");
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    const stravaTokens = await refreshTokenRepository.find({
        where: { provider: "strava" },
        order: { createdAt: 'DESC' },
        take: 1
    });
    const [latestToken] = stravaTokens;
    if (!latestToken?.providerUserId) {
        return res.status(400).json({
            message: "No Strava connection found. Please connect your Strava account first."
        });
    }
    const athleteId = latestToken.providerUserId;
    try {
        const response = await getAthleteStravaActivities(athleteId, Number(page), Number(perPage), before ? new Date(String(before)) : undefined, after ? new Date(String(after)) : undefined);
        return res.json(response);
    }
    catch (error) {
        console.error("Error fetching Strava activities:", error);
        return res.status(500).json({
            message: "Failed to fetch Strava activities",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}));
export { router as stravaActivitiesRouter };
//# sourceMappingURL=strava-activities.controller.js.map