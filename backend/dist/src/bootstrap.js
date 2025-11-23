import dotenv from "dotenv";
import { AppDataSource } from "./database/postgres/data-source.js";
import { driver } from "./database/neo4j/data-source.js";
import { startScheduledJobs } from "./jobs/scheduler.js";
dotenv.config();
let initializationPromise = null;
let jobsStarted = false;
async function initializeDataSources() {
    if (AppDataSource.isInitialized) {
        return;
    }
    await AppDataSource.initialize();
    try {
        await AppDataSource.query("SET default_transaction_use_follower_reads = off");
    }
    catch (err) {
        console.warn("Could not disable follower reads", err);
    }
    const shouldSyncSchema = process.env.TYPEORM_SYNC === "true";
    if (shouldSyncSchema) {
        await AppDataSource.synchronize();
        console.info("Database schema synchronized");
    }
}
async function verifyNeo4jConnection() {
    try {
        await driver.getServerInfo();
    }
    catch (error) {
        console.error("Failed to connect to Neo4j", error);
        throw error;
    }
}
export async function bootstrap({ startJobs = false } = {}) {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            await initializeDataSources();
            await verifyNeo4jConnection();
        })();
    }
    await initializationPromise;
    if (startJobs && !jobsStarted) {
        startScheduledJobs();
        jobsStarted = true;
    }
}
//# sourceMappingURL=bootstrap.js.map