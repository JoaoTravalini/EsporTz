import { AppDataSource } from "./postgres/data-source.js";
import { setupNeo4jIndexes } from "./neo4j/setup-indexes.js";
async function setupDatabase() {
    console.log("🚀 Starting database setup...\n");
    try {
        // Initialize PostgreSQL connection
        console.log("📦 Initializing PostgreSQL connection...");
        await AppDataSource.initialize();
        console.log("✅ PostgreSQL connected\n");
        // Run migrations
        console.log("🔄 Running PostgreSQL migrations...");
        await AppDataSource.runMigrations();
        console.log("✅ Migrations completed\n");
        // Setup Neo4j indexes
        console.log("🔧 Setting up Neo4j indexes...");
        await setupNeo4jIndexes();
        console.log("✅ Neo4j setup completed\n");
        console.log("✅ Database setup completed successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Database setup failed:", error);
        process.exit(1);
    }
}
setupDatabase();
//# sourceMappingURL=setup-database.js.map