import { AppDataSource } from "../database/postgres/data-source.js";
import { Like } from "../database/postgres/entities/like-entity.js";

const likeRepository = AppDataSource.getRepository(Like);

type GetLikeById = {
	id: string;
	relations?: string[];
};

type GetLikeByReference = {
	userId: string;
	postId: string;
	relations?: string[];
};

type GetLikeParams = GetLikeById | GetLikeByReference;

const defaultLikeRelations = ["user", "post"];

export const getLike = async (params: GetLikeParams): Promise<Like | undefined> => {
	const relations = params.relations ?? defaultLikeRelations;

	if ("id" in params) {
		const like = await likeRepository.findOne({ where: { id: params.id }, relations });
		return like ?? undefined;
	}

	const like = await likeRepository.findOne({
		where: {
			user: { id: params.userId },
			post: { id: params.postId }
		},
		relations
	});

	return like ?? undefined;
};
