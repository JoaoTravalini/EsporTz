import { Router } from "express";
import { getPlatformStats, getUserStats, getSportStats, getTrendingContent, getComparisonStats } from "./statistics-controller.js";
const router = Router();
// Public routes
router.get("/platform", getPlatformStats);
router.get("/trending", getTrendingContent);
router.get("/compare", getComparisonStats);
// Parameterized routes
router.get("/user/:userId", getUserStats);
router.get("/sport/:sportId", getSportStats);
export default router;
//# sourceMappingURL=routes.js.map