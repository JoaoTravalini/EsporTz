import "reflect-metadata";
import { AppDataSource } from "../src/database/postgres/data-source.js";
import { driver } from "../src/database/neo4j/data-source.js";
import { createUser } from "../src/services/create-user.js";
import { createPost } from "../src/services/create-post.js";
import { createComment } from "../src/services/create-comment.js";
import { createLike } from "../src/services/create-like.js";
import { createFollower } from "../src/services/create-follower.js";
import { getUser } from "../src/services/get-user.js";
import { getPost } from "../src/services/get-post.js";
import { getComment } from "../src/services/get-comment.js";
import { getLike } from "../src/services/get-like.js";
import { getFollower } from "../src/services/get-follower.js";
import { Post } from "../src/database/postgres/entities/post-entity.js";
import { ILike } from "typeorm";
const logSection = (title, payload) => {
    console.log(`\n=== ${title} ===`);
    console.dir(payload, { depth: null });
};
const main = async () => {
    if (!AppDataSource.isInitialized) {
        AppDataSource.setOptions({
            timeTravelQueries: undefined
        });
        await AppDataSource.initialize();
    }
    const timestamp = Date.now();
    const userAlpha = await createUser({
        email: `bruno2002.raiado@gmail.com`,
        password: "TestPass123!",
        name: "Bruno Bianchi"
    });
    const userBeta = await createUser({
        email: `beta-${timestamp}@esportz.test`,
        password: "TestPass123!",
        name: "Beta Tester"
    });
    if (!userAlpha || !userBeta) {
        throw new Error("Failed to create seed users");
    }
    logSection("Created Users", { userAlpha, userBeta });
    const followResult = await createFollower({
        followerId: userBeta.id,
        followedId: userAlpha.id
    });
    logSection("Follow Result", followResult);
    const post = await createPost({
        authorId: userAlpha.id,
        content: `Hello EsporTz! Timestamp ${timestamp}`
    });
    if (!post) {
        throw new Error("Post creation failed");
    }
    logSection("Post", post);
    const comment = await createComment({
        authorId: userBeta.id,
        parentPostId: post.id,
        content: "Nice to connect here!"
    });
    if (!comment) {
        throw new Error("Comment creation failed");
    }
    logSection("Comment", comment);
    const like = await createLike({
        userId: userBeta.id,
        postId: post.id
    });
    logSection("Like", like);
    const refreshedUserAlpha = await getUser({ id: userAlpha.id, relations: ["posts", "followers", "following"] });
    const refreshedPost = await getPost({ id: post.id });
    const refreshedComment = await getComment({ id: comment.id });
    const refreshedLike = like ? await getLike({ id: like.id }) : undefined;
    const refreshedFollower = await getFollower({ followerId: userBeta.id, followedId: userAlpha.id });
    logSection("Fetched User", refreshedUserAlpha);
    logSection("Fetched Post", refreshedPost);
    logSection("Fetched Comment", refreshedComment);
    logSection("Fetched Like", refreshedLike);
    logSection("Fetched Follower", refreshedFollower);
    const postRepository = AppDataSource.getRepository(Post);
    const searchTerm = "hello";
    const searchResults = await postRepository.find({
        where: { content: ILike(`%${searchTerm}%`) },
        relations: ["author"]
    });
    logSection(`Search Results for "${searchTerm}"`, searchResults);
};
main()
    .catch(error => {
    console.error("Service smoke test failed", error);
    process.exitCode = 1;
})
    .finally(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    await driver.close();
});
//# sourceMappingURL=service-smoke-test.js.map