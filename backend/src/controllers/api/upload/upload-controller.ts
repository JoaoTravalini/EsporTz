import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { asyncHandler } from "../utils/async-handler.js";

const router: ExpressRouter = Router();

router.post(
    "/",
    asyncHandler(async (_req, res) => {
        res.status(501).json({
            message: "Upload endpoint not implemented yet"
        });
    })
);

export const uploadRouter = router;
