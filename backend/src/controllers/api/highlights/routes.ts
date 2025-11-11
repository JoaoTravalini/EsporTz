import { Router } from "express";
import multer from 'multer';
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

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 2 // Max 2 files (video + thumbnail)
    },
    fileFilter: (req, file, cb) => {
        // Allow video and image files
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video and image files are allowed'));
        }
    }
});

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