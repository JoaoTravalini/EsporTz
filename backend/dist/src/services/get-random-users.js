import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";
const userRepository = AppDataSource.getRepository(User);
export const getRandomUsers = async ({ limit = 5, excludeUserId } = {}) => {
    const queryBuilder = userRepository.createQueryBuilder("user");
    if (excludeUserId) {
        queryBuilder.where("user.id != :excludeUserId", { excludeUserId });
    }
    const users = await queryBuilder
        .orderBy("RANDOM()")
        .limit(limit)
        .getMany();
    return users;
};
//# sourceMappingURL=get-random-users.js.map