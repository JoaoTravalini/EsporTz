import cron from "node-cron";
import { calculateSimilaritiesBatch } from "./similarity-calculator.js";
import { updateTrendingCache } from "../services/trending-service.js";
/**
 * Configura e inicia todos os jobs agendados
 */
export function startScheduledJobs() {
    console.log("⏰ Starting scheduled jobs...");
    // Job 1: Calcular similaridades entre usuários a cada 6 horas
    cron.schedule("0 */6 * * *", async () => {
        console.log("🔄 Running similarity calculation job...");
        try {
            await calculateSimilaritiesBatch(50, 100);
        }
        catch (error) {
            console.error("❌ Similarity calculation job failed:", error);
        }
    });
    console.log("✅ Similarity calculation job scheduled (every 6 hours)");
    // Job 2: Atualizar cache de trending hashtags a cada 15 minutos
    cron.schedule("*/15 * * * *", async () => {
        console.log("🔄 Running trending cache update job...");
        try {
            await updateTrendingCache();
        }
        catch (error) {
            console.error("❌ Trending cache update job failed:", error);
        }
    });
    console.log("✅ Trending cache update job scheduled (every 15 minutes)");
    console.log("✅ All scheduled jobs started successfully");
}
/**
 * Para todos os jobs agendados
 */
export function stopScheduledJobs() {
    cron.getTasks().forEach(task => task.stop());
    console.log("⏹️  All scheduled jobs stopped");
}
//# sourceMappingURL=scheduler.js.map