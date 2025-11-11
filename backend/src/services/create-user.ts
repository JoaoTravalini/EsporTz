import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";
import { getUser } from "./get-user.js";

const userRepository = AppDataSource.getRepository(User);

type CreateUserParams = Pick<User, "email" | "password" | "name"> &
    Partial<Pick<User, "provider" | "imgURL">>;

export const createUser = async (payload: CreateUserParams): Promise<User | undefined> => {
    const existingUser = await getUser({ email: payload.email });
    if (existingUser) {
        return existingUser;
    }

    const userToCreate = userRepository.create({
        ...payload,
        provider: payload.provider ?? "email"
    });

    const savedUser = await userRepository.save(userToCreate);

    try {
        await driver.executeQuery(
            `MERGE (u:User {id: $userId})`,
            { userId: savedUser.id }
        );
    } catch (error) {
        console.warn("Failed to mirror user node", error);
    }

    return savedUser;
};