import "reflect-metadata";
import { AppDataSource } from "../src/database/postgres/data-source.js";
async function fixPostWorkoutActivitiesTable() {
    try {
        await AppDataSource.initialize();
        console.log("Connected to database");
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            // Drop the existing table
            console.log("Dropping post_workout_activities table...");
            await queryRunner.query(`DROP TABLE IF EXISTS "post_workout_activities" CASCADE`);
            console.log("Table dropped successfully");
            // Let TypeORM recreate it with the new schema
            console.log("Synchronizing schema...");
            await AppDataSource.synchronize();
            console.log("Schema synchronized successfully");
            console.log("\n✅ post_workout_activities table has been recreated with composite primary key");
        }
        finally {
            await queryRunner.release();
        }
        await AppDataSource.destroy();
    }
    catch (error) {
        console.error("Error fixing table:", error);
        process.exit(1);
    }
}
fixPostWorkoutActivitiesTable();
//# sourceMappingURL=fix-post-workout-activities.js.map