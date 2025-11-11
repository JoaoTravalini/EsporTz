import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";
import { calculateUserSimilarity } from "../services/recommendation-service.js";

/**
 * Calcula similaridades entre usuários em lotes
 * Prioriza usuários ativos recentemente
 */
export async function calculateSimilaritiesBatch(
    batchSize: number = 50,
    delayMs: number = 100
): Promise<void> {
    console.log("🔄 Starting similarity calculation batch job...");

    try {
        const userRepository = AppDataSource.getRepository(User);

        // Busca usuários ativos recentemente (que criaram posts nos últimos 30 dias)
        const activeUsers = await userRepository
            .createQueryBuilder("user")
            .leftJoin("user.posts", "post")
            .where("post.createdAt > :date", {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            })
            .groupBy("user.id")
            .orderBy("MAX(post.createdAt)", "DESC")
            .take(batchSize)
            .getMany();

        console.log(`📊 Found ${activeUsers.length} active users to process`);

        let processed = 0;
        let errors = 0;

        for (const user of activeUsers) {
            try {
                await calculateUserSimilarity(user.id);
                processed++;

                // Delay entre processamentos para não sobrecarregar
                if (delayMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            } catch (error) {
                console.error(`❌ Error calculating similarity for user ${user.id}:`, error);
                errors++;
            }
        }

        console.log(`✅ Similarity calculation completed: ${processed} processed, ${errors} errors`);
    } catch (error) {
        console.error("❌ Similarity calculation batch job failed:", error);
        throw error;
    }
}

/**
 * Calcula similaridades para todos os usuários (pode demorar muito)
 * Use com cuidado em produção
 */
export async function calculateAllSimilarities(
    batchSize: number = 50,
    delayMs: number = 100
): Promise<void> {
    console.log("🔄 Starting full similarity calculation...");

    try {
        const userRepository = AppDataSource.getRepository(User);
        const totalUsers = await userRepository.count();

        console.log(`📊 Total users to process: ${totalUsers}`);

        let offset = 0;
        let totalProcessed = 0;
        let totalErrors = 0;

        while (offset < totalUsers) {
            const users = await userRepository.find({
                skip: offset,
                take: batchSize
            });

            console.log(`Processing batch ${offset / batchSize + 1} (${users.length} users)...`);

            for (const user of users) {
                try {
                    await calculateUserSimilarity(user.id);
                    totalProcessed++;

                    if (delayMs > 0) {
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                } catch (error) {
                    console.error(`❌ Error calculating similarity for user ${user.id}:`, error);
                    totalErrors++;
                }
            }

            offset += batchSize;
        }

        console.log(`✅ Full similarity calculation completed: ${totalProcessed} processed, ${totalErrors} errors`);
    } catch (error) {
        console.error("❌ Full similarity calculation failed:", error);
        throw error;
    }
}
