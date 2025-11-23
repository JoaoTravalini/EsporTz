import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";
const postRepository = AppDataSource.getRepository(Post);
const defaultPostRelations = [
    "author",
    "parent",
    "comments",
    "comments.author",
    "likes",
    "likes.user",
    "repostedBy",
    "workoutActivity",
    "workoutActivities",
    "hashtags"
];
export const getPost = async ({ id, relations }) => {
    const post = await postRepository.findOne({
        where: { id },
        relations: relations ?? defaultPostRelations
    });
    return post ?? undefined;
};
//# sourceMappingURL=get-post.js.map