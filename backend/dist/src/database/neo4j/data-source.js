import neo4j from "neo4j-driver";
import dotenv from "dotenv";
dotenv.config();
const URI = process.env.NEO4J_DATABASE_URL;
const USER = process.env.NEO4J_DATABASE_USER;
const PASSWORD = process.env.NEO4J_DATABASE_PASSWORD;
if (!URI || !USER || !PASSWORD) {
    console.error("❌ Missing Neo4j environment variables.");
    process.exit(1);
}
export const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
//# sourceMappingURL=data-source.js.map