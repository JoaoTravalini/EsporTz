import { createPost } from "./create-post.js";
export const createComment = async ({ authorId, parentPostId, content }) => {
    return createPost({
        authorId,
        content,
        parentId: parentPostId
    });
};
//# sourceMappingURL=create-comment.js.map