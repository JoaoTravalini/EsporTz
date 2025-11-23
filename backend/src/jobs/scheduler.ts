import cron from "node-cron";
import { calculateSimilaritiesBatch } from "./similarity-calculator.js";


/**
 * Configura e inicia todos os jobs agendados
 */
export function startScheduledJobs(): void {
    console.log("⏰ Starting scheduled jobs...");

    // Job 1: Calcular similaridades entre usuários a cada 6 horas
    cron.schedule("0 */6 * * *", async () => {
        console.log("🔄 Running similarity calculation job...");
        try {
            await calculateSimilaritiesBatch(50, 100);
        } catch (error) {
            console.error("❌ Similarity calculation job failed:", error);
        }
    });
    console.log("✅ Similarity calculation job scheduled (every 6 hours)");



    console.log("✅ All scheduled jobs started successfully");
}

/**
 * Para todos os jobs agendados
 */
export function stopScheduledJobs(): void {
    cron.getTasks().forEach(task => task.stop());
    console.log("⏹️  All scheduled jobs stopped");
}
