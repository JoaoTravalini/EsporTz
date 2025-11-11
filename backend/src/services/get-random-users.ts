import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";
import { Not } from "typeorm";

const userRepository = AppDataSource.getRepository(User);

type GetRandomUsersParams = {
    limit?: number;
    excludeUserId?: string;
};

export const getRandomUsers = async ({ 
    limit = 5, 
    excludeUserId 
}: GetRandomUsersParams = {}): Promise<User[]> => {
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

