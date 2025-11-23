import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";
import { driver } from "../database/neo4j/data-source.js";
const userRepository = AppDataSource.getRepository(User);
export const updateUser = async (params) => {
    const { userId, name, bio, location, website, imgURL } = params;
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        return undefined;
    }
    // Atualiza apenas os campos fornecidos
    if (name !== undefined)
        user.name = name;
    if (bio !== undefined)
        user.bio = bio;
    if (location !== undefined)
        user.location = location;
    if (website !== undefined)
        user.website = website;
    if (imgURL !== undefined)
        user.imgURL = imgURL;
    const updatedUser = await userRepository.save(user);
    // Sincroniza com Neo4j
    try {
        await driver.executeQuery(`MERGE (u:User {id: $userId})
             SET u.name = $name,
                 u.imgURL = $imgURL`, {
            userId: updatedUser.id,
            name: updatedUser.name,
            imgURL: updatedUser.imgURL || null
        });
        console.log(`✅ User ${userId} synced to Neo4j`);
    }
    catch (error) {
        console.warn("Failed to sync user to Neo4j:", error);
    }
    return updatedUser;
};
export const updateUserPreferences = async (params) => {
    const { userId, preferences } = params;
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        return undefined;
    }
    // Merge preferences with existing ones
    const currentPreferences = user.preferences || {
        favoriteSports: [],
        notifications: {
            highlights: true,
            analyses: true,
            matches: true,
            followedTeams: true
        },
        privacy: {
            profilePublic: true,
            showStats: true,
            allowAnalysisSharing: true
        }
    };
    user.preferences = {
        favoriteSports: preferences.favoriteSports !== undefined
            ? preferences.favoriteSports
            : currentPreferences.favoriteSports,
        notifications: {
            ...currentPreferences.notifications,
            ...preferences.notifications
        },
        privacy: {
            ...currentPreferences.privacy,
            ...preferences.privacy
        }
    };
    const updatedUser = await userRepository.save(user);
    return updatedUser;
};
//# sourceMappingURL=update-user.js.map