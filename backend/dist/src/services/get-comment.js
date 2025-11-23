import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";
const postRepository = AppDataSource.getRepository(Post);
const defaultCommentRelations = [
    "author",
    "parent",
    "likes",
    "likes.user"
];
export const getComment = async ({ id, relations }) => {
    const comment = await postRepository.findOne({
        where: { id },
        relations: relations ?? defaultCommentRelations
    });
    if (!comment?.parent) {
        return undefined;
    }
    return comment;
};
//# sourceMappingURL=get-comment.js.map