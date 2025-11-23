import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";

const userRepository = AppDataSource.getRepository(User);

type DeleteFollowerParams = {
	followerId: string;
	followedId: string;
};

export const deleteFollower = async ({
	followerId,
	followedId
}: DeleteFollowerParams): Promise<boolean> => {
	if (followerId === followedId) {
		return false;
	}

	const follower = await userRepository.findOne({ 
		where: { id: followerId }, 
		relations: ["following"] 
	});

	if (!follower) {
		return false;
	}

	const isFollowing = (follower.following ?? []).some(user => user.id === followedId);
	if (!isFollowing) {
		return true; // Already not following
	}

	// Remove from PostgreSQL
	await userRepository
		.createQueryBuilder()
		.relation(User, "following")
		.of(followerId)
		.remove(followedId);

	// Remove from Neo4j
	try {
		await driver.executeQuery(
			`MATCH (f:User {id: $followerId})-[r:FOLLOWS]->(t:User {id: $followedId})
			 DELETE r`,
			{ followerId, followedId }
		);
		console.log(`✅ Neo4j: User ${followerId} unfollowed ${followedId}`);
	} catch (error) {
		console.error("❌ Failed to remove follow graph relation", error);
	}

	return true;
};
