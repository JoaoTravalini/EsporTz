import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";
import { IsNull } from "typeorm";
const postRepository = AppDataSource.getRepository(Post);
const defaultRelations = [
    "author",
    "parent",
    "comments",
    "comments.author",
    "comments.likes",
    "comments.likes.user",
    "likes",
    "likes.user",
    "repostedBy",
    "workoutActivities",
    "hashtags"
];
export const getPosts = async () => {
    return postRepository.find({
        where: { parent: IsNull() },
        relations: defaultRelations,
        order: { createdAt: "DESC" }
    });
};
//# sourceMappingURL=get-posts.js.map