import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";
const userRepository = AppDataSource.getRepository(User);
export const getUser = async (params) => {
    const { relations = [] } = params;
    const whereClause = "id" in params ? { id: params.id } : { email: params.email };
    const user = await userRepository.findOne({ where: whereClause, relations });
    return user ?? undefined;
};
//# sourceMappingURL=get-user.js.map