import "reflect-metadata";
import { AppDataSource } from "../src/database/postgres/data-source.js";
import { User } from "../src/database/postgres/entities/user-entity.js";
async function checkUsers() {
    try {
        await AppDataSource.initialize();
        console.log("✅ Connected to database");
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            select: ['id', 'name', 'email', 'createdAt']
        });
        console.log(`\n📊 Total users in database: ${users.length}\n`);
        if (users.length === 0) {
            console.log("⚠️  No users found in database!");
            console.log("💡 You may need to register a user first.");
        }
        else {
            console.log("Users:");
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email})`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log();
            });
        }
        await AppDataSource.destroy();
    }
    catch (error) {
        console.error("❌ Error checking users:", error);
        process.exit(1);
    }
}
checkUsers();
//# sourceMappingURL=check-users.js.map