import "reflect-metadata";
import dotenv from "dotenv";
import { createApp } from "./app.js";
import { bootstrap } from "./bootstrap.js";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
	try {
		await bootstrap({ startJobs: true });
		const app = createApp();
		app.listen(PORT, () => {
			console.log(`EsporTz API listening on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("Error during application bootstrap", err);
		process.exit(1);
	}
}

void startServer();

