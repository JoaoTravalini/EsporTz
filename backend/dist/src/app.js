import express from "express";
import cors from "cors";
import { r as apiRouter } from "./controllers/api/api-controller.js";
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/api", apiRouter);
    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    app.use((err, _req, res, _next) => {
        console.log(err);
        console.error("Unhandled error", err);
        const errorResponse = {
            message: "Internal server error",
            error: err instanceof Error ? err.message : String(err)
        };
        if (err instanceof Error && err.stack) {
            console.error(err.stack);
        }
        res.status(500).json(errorResponse);
    });
    return app;
}
//# sourceMappingURL=app.js.map