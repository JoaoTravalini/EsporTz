import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";

const userRepository = AppDataSource.getRepository(User);

type CreateFollowerParams = {
	followerId: string;
	followedId: string;
};

export const createFollower = async ({
	followerId,
	followedId
}: CreateFollowerParams): Promise<boolean> => {
	if (followerId === followedId) {
		return false;
	}

	const [follower, followed] = await Promise.all([
		userRepository.findOne({ where: { id: followerId }, relations: ["following"] }),
		userRepository.findOne({ where: { id: followedId } })
	]);

	if (!follower || !followed) {
		return false;
	}

	const alreadyFollowing = (follower.following ?? []).some(user => user.id === followedId);
	if (alreadyFollowing) {
		return true;
	}

	await userRepository
		.createQueryBuilder()
		.relation(User, "following")
		.of(followerId)
		.add(followedId);

	try {
		await driver.executeQuery(
			`MERGE (f:User {id: $followerId})
			 MERGE (t:User {id: $followedId})
			 MERGE (f)-[:FOLLOWS]->(t)`,
			{ followerId, followedId }
		);
		console.log(`✅ Neo4j: User ${followerId} now follows ${followedId}`);
	} catch (error) {
		console.error("❌ Failed to mirror follow graph relation", error);
	}

	return true;
};
