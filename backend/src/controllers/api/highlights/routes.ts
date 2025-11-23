import { Router } from "express";
import { upload } from "../../../middlewares/multer-middleware.js";
import {
    getHighlights,
    getHighlightById,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    toggleLikeHighlight,
    getUserHighlights,
    getFeaturedHighlights,
    searchHighlights
} from "./highlights-controller.js";

const router = Router();

// Public routes
router.get("/", getHighlights);
router.get("/featured", getFeaturedHighlights);
router.get("/search", searchHighlights);
router.get("/:id", getHighlightById);
router.get("/user/:userId", getUserHighlights);

// Protected routes (require authentication)
router.post("/", upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), createHighlight);

router.put("/:id", updateHighlight);
router.delete("/:id", deleteHighlight);
router.post("/:id/like", toggleLikeHighlight);

export default router;