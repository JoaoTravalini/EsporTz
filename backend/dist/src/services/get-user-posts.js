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
    "workoutActivity",
    "workoutActivities",
    "hashtags"
];
export const getUserPosts = async ({ userId, relations }) => {
    return postRepository.find({
        where: {
            author: { id: userId },
            parent: IsNull() // Apenas posts principais, não comentários
        },
        relations: relations ?? defaultRelations,
        order: { createdAt: "DESC" }
    });
};
//# sourceMappingURL=get-user-posts.js.map