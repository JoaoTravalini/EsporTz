import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";

const userRepository = AppDataSource.getRepository(User);

type GetUserParams =
    | { id: string; email?: never; relations?: string[] }
    | { email: string; id?: never; relations?: string[] };

export const getUser = async (params: GetUserParams): Promise<User | undefined> => {
    const { relations = [] } = params;
    const whereClause = "id" in params ? { id: params.id } : { email: params.email };
    const user = await userRepository.findOne({ where: whereClause, relations });
    return user ?? undefined;
};
