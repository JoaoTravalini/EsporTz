import "reflect-metadata";
import { AppDataSource } from "../src/database/postgres/data-source.js";
import { WorkoutActivity } from "../src/database/postgres/entities/workout-activity.js";
const main = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    const workoutRepo = AppDataSource.getRepository(WorkoutActivity);
    const activities = await workoutRepo.find({ take: 10 });
    console.log("Found", activities.length, "workout activities");
    for (const activity of activities) {
        console.log(activity.id, activity.name, activity.startDate);
    }
};
main()
    .catch(error => {
    console.error("Failed to list workout activities", error);
    process.exitCode = 1;
})
    .finally(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});
//# sourceMappingURL=list-workouts.js.map