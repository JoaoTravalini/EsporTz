import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";

const postRepository = AppDataSource.getRepository(Post);

type GetPostParams = {
    id: string;
    relations?: string[];
};

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

export const getPost = async ({ id, relations }: GetPostParams): Promise<Post | undefined> => {
    const post = await postRepository.findOne({
        where: { id },
        relations: relations ?? defaultPostRelations
    });

    return post ?? undefined;
};
