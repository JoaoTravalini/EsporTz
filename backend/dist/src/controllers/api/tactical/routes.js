import { Router } from "express";
import { getTacticalAnalyses, getTacticalAnalysisById, createTacticalAnalysis, updateTacticalAnalysis, deleteTacticalAnalysis, toggleLikeAnalysis, addComment, getComments, getUserTacticalAnalyses, searchTacticalAnalyses } from "./tactical-analysis-controller.js";
const router = Router();
// Public routes
router.get("/", getTacticalAnalyses);
router.get("/search", searchTacticalAnalyses);
router.get("/:id", getTacticalAnalysisById);
router.get("/:id/comments", getComments);
router.get("/user/:userId", getUserTacticalAnalyses);
// Protected routes (require authentication)
router.post("/", createTacticalAnalysis);
router.put("/:id", updateTacticalAnalysis);
router.delete("/:id", deleteTacticalAnalysis);
router.post("/:id/like", toggleLikeAnalysis);
router.post("/:id/comments", addComment);
export default router;
//# sourceMappingURL=routes.js.map