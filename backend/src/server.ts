import "reflect-metadata";
import express, { type Express } from "express";
import type { NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv"
dotenv.config();
import cors from "cors";
import {driver} from "./database/neo4j/data-source.js"
import {r as apiRouter} from "./controllers/api/api-controller.js";
import { startScheduledJobs } from "./jobs/scheduler.js";
const app: Express = express();
import { AppDataSource } from "./database/postgres/data-source.js";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);
app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	console.log(err)
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

const PORT = Number(process.env.PORT ?? 3000);
const SHOULD_SYNC_SCHEMA = process.env.TYPEORM_SYNC === "true";

AppDataSource.initialize()
	.then(async dataSource => {
		 await driver.getServerInfo();

		try {
			await dataSource.query("SET default_transaction_use_follower_reads = off");
		} catch (err) {
			console.warn("Could not disable follower reads", err);
		}

		if (SHOULD_SYNC_SCHEMA) {
			await dataSource.synchronize();
			console.info("Database schema synchronized");
		}

		app.listen(PORT, () => {
			console.log(`EsporTz API listening on http://localhost:${PORT}`);
			
			// Inicia scheduled jobs
			startScheduledJobs();
		});
	})
	.catch(err => {
		console.error("Error during Data Source initialization", err);
	});

