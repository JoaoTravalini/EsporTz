import { driver } from "./data-source.js";

/**
 * Cria constraints e índices no Neo4j para otimizar queries
 */
export async function setupNeo4jIndexes(): Promise<void> {
    console.log("🔧 Setting up Neo4j indexes and constraints...");

    try {
        // Constraints de unicidade
        await driver.executeQuery(
            `CREATE CONSTRAINT user_id_unique IF NOT EXISTS
             FOR (u:User) REQUIRE u.id IS UNIQUE`
        );
        console.log("✅ Created User ID unique constraint");

        await driver.executeQuery(
            `CREATE CONSTRAINT post_id_unique IF NOT EXISTS
             FOR (p:Post) REQUIRE p.id IS UNIQUE`
        );
        console.log("✅ Created Post ID unique constraint");

        await driver.executeQuery(
            `CREATE CONSTRAINT hashtag_tag_unique IF NOT EXISTS
             FOR (h:Hashtag) REQUIRE h.tag IS UNIQUE`
        );
        console.log("✅ Created Hashtag tag unique constraint");

        // Índices para otimizar queries
        await driver.executeQuery(
            `CREATE INDEX user_id_index IF NOT EXISTS
             FOR (u:User) ON (u.id)`
        );
        console.log("✅ Created User ID index");

        await driver.executeQuery(
            `CREATE INDEX post_id_index IF NOT EXISTS
             FOR (p:Post) ON (p.id)`
        );
        console.log("✅ Created Post ID index");

        await driver.executeQuery(
            `CREATE INDEX post_created_index IF NOT EXISTS
             FOR (p:Post) ON (p.createdAt)`
        );
        console.log("✅ Created Post createdAt index");

        await driver.executeQuery(
            `CREATE INDEX hashtag_tag_index IF NOT EXISTS
             FOR (h:Hashtag) ON (h.tag)`
        );
        console.log("✅ Created Hashtag tag index");

        console.log("✅ Neo4j indexes and constraints setup complete!");
    } catch (error) {
        console.error("❌ Error setting up Neo4j indexes:", error);
        throw error;
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    setupNeo4jIndexes()
        .then(() => {
            console.log("✅ Setup completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Setup failed:", error);
            process.exit(1);
        });
}
