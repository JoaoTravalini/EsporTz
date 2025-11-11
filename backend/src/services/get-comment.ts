import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";

const postRepository = AppDataSource.getRepository(Post);

type GetCommentParams = {
	id: string;
	relations?: string[];
};

const defaultCommentRelations = [
	"author",
	"parent",
	"likes",
	"likes.user"
];

export const getComment = async ({ id, relations }: GetCommentParams): Promise<Post | undefined> => {
	const comment = await postRepository.findOne({
		where: { id },
		relations: relations ?? defaultCommentRelations
	});

	if (!comment?.parent) {
		return undefined;
	}

	return comment;
};
