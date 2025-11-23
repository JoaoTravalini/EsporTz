import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";
import { User } from "../database/postgres/entities/user-entity.js";
const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);
export const createRepost = async ({ userId, postId }) => {
    const [post, user] = await Promise.all([
        postRepository.findOne({ where: { id: postId }, relations: ["repostedBy"] }),
        userRepository.findOne({ where: { id: userId } })
    ]);
    if (!post || !user) {
        return undefined;
    }
    const alreadyReposted = (post.repostedBy ?? []).some(reposter => reposter.id === userId);
    if (!alreadyReposted) {
        await postRepository
            .createQueryBuilder()
            .relation(Post, "repostedBy")
            .of(postId)
            .add(userId);
        try {
            await driver.executeQuery(`MERGE (u:User {id: $userId})
                 MERGE (p:Post {id: $postId})
                 MERGE (u)-[:REPOSTED]->(p)`, { userId, postId });
        }
        catch (error) {
            console.warn("Failed to mirror repost relationship", error);
        }
    }
    const updated = await postRepository.findOne({
        where: { id: postId },
        relations: [
            "author",
            "parent",
            "comments",
            "comments.author",
            "comments.likes",
            "comments.likes.user",
            "likes",
            "likes.user",
            "repostedBy"
        ]
    });
    return updated ?? undefined;
};
//# sourceMappingURL=create-repost.js.map