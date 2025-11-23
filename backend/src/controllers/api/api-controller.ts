import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { r as authRouter } from "./auth/auth-controller.js";
import { usersRouter } from "./users/users-controller.js";
import { postsRouter } from "./posts/posts-controller.js";
import { likesRouter } from "./likes/likes-controller.js";
import { followersRouter } from "./followers/followers-controller.js";
import highlightsRouter from "./highlights/routes.js";
import tacticalRouter from "./tactical/routes.js";
import statsRouter from "./stats/routes.js";
import { stravaActivitiesRouter } from "./strava/strava-activities.controller.js";
import { hashtagsRouter } from "./hashtags/hashtags-controller.js";
import { recommendationsRouter } from "./recommendations/recommendations-controller.js";
import { mentionsRouter } from "./mentions/mentions-controller.js";
import { notificationsRouter } from "./notifications/notifications-controller.js";

const router: ExpressRouter = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/likes", likesRouter);
router.use("/followers", followersRouter);
router.use("/highlights", highlightsRouter);
router.use("/tactical", tacticalRouter);
router.use("/stats", statsRouter);
router.use("/strava", stravaActivitiesRouter);
router.use("/hashtags", hashtagsRouter);
router.use("/recommendations", recommendationsRouter);
router.use("/mentions", mentionsRouter);
router.use("/notifications", notificationsRouter);

export const r = router;