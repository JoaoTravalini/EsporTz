import { createPost } from "./create-post.js";
import type { Post } from "../database/postgres/entities/post-entity.js";

type CreateCommentParams = {
	authorId: string;
	parentPostId: string;
	content: string;
};

export const createComment = async ({
	authorId,
	parentPostId,
	content
}: CreateCommentParams): Promise<Post | undefined> => {
	return createPost({
		authorId,
		content,
		parentId: parentPostId
	});
};
