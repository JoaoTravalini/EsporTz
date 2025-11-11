import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { Like } from "../database/postgres/entities/like-entity.js";
import { Post } from "../database/postgres/entities/post-entity.js";
import { User } from "../database/postgres/entities/user-entity.js";

const likeRepository = AppDataSource.getRepository(Like);
const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);

type CreateLikeParams = {
    userId: string;
    postId: string;
};

export const createLike = async ({ userId, postId }: CreateLikeParams): Promise<Like | undefined> => {
    const [user, post] = await Promise.all([
        userRepository.findOne({ where: { id: userId } }),
        postRepository.findOne({ where: { id: postId } })
    ]);

    if (!user || !post) {
        return undefined;
    }

    const existingLike = await likeRepository.findOne({
        where: {
            user: { id: user.id },
            post: { id: post.id }
        },
        relations: ["user", "post"]
    });

    if (existingLike) {
        return existingLike;
    }

    const newLike = likeRepository.create({
        user,
        post
    });

    const savedLike = await likeRepository.save(newLike);

    try {
        await driver.executeQuery(
            `MERGE (u:User {id: $userId})
             MERGE (p:Post {id: $postId})
             MERGE (u)-[:LIKED]->(p)`,
            { userId: user.id, postId: post.id }
        );
    } catch (error) {
        console.warn("Failed to mirror like in Neo4j", error);
    }

    const likeWithRelations = await likeRepository.findOne({
        where: { id: savedLike.id },
        relations: ["user", "post"]
    });

    return likeWithRelations ?? undefined;
};