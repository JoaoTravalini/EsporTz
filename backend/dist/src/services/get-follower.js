import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";
const userRepository = AppDataSource.getRepository(User);
export const getFollower = async ({ followerId, followedId }) => {
    const follower = await userRepository.findOne({
        where: { id: followerId },
        relations: ["following"]
    });
    if (!follower) {
        return undefined;
    }
    return follower.following?.find(user => user.id === followedId) ?? undefined;
};
//# sourceMappingURL=get-follower.js.map