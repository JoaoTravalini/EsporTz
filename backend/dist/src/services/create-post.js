import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";
import { User } from "../database/postgres/entities/user-entity.js";
import { WorkoutActivity } from "../database/postgres/entities/workout-activity.js";
import { In } from "typeorm";
import { extractHashtags, upsertHashtags, syncHashtagsToNeo4j } from "./hashtag-service.js";
import { processMentions } from "./mention-service.js";
const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);
const workoutActivityRepository = AppDataSource.getRepository(WorkoutActivity);
export const createPost = async ({ authorId, content, parentId, workoutActivityIds }) => {
    console.log('[createPost] Starting with params:', { authorId, contentLength: content.length, parentId, workoutActivityIds });
    const [author, parent, workoutActivities] = await Promise.all([
        userRepository.findOne({ where: { id: authorId } }),
        parentId ? postRepository.findOne({ where: { id: parentId } }) : Promise.resolve(null),
        workoutActivityIds && workoutActivityIds.length > 0
            ? workoutActivityRepository.find({ where: { id: In(workoutActivityIds) } })
            : Promise.resolve([])
    ]);
    console.log('[createPost] Database lookup results:', {
        authorFound: !!author,
        authorId: author?.id,
        parentFound: parentId ? !!parent : 'N/A',
        workoutActivitiesCount: workoutActivities.length
    });
    if (!author || (parentId && !parent)) {
        console.log('[createPost] Validation failed:', {
            authorMissing: !author,
            parentMissing: parentId && !parent
        });
        return undefined;
    }
    const primaryWorkoutActivity = workoutActivities[0];
    // Extrai hashtags do conteúdo
    const hashtagStrings = extractHashtags(content);
    console.log(`[createPost] Extracted ${hashtagStrings.length} hashtags:`, hashtagStrings);
    // Cria ou atualiza hashtags no PostgreSQL
    const hashtags = await upsertHashtags(hashtagStrings, content);
    const newPost = postRepository.create({
        content,
        author,
        parent: parent ?? null,
        workoutActivity: primaryWorkoutActivity,
        workoutActivityId: primaryWorkoutActivity?.id ?? null,
        workoutActivities: workoutActivities,
        hashtags: hashtags
    });
    const savedPost = await postRepository.save(newPost);
    const postCreatedAtIso = savedPost.createdAt.toISOString();
    const postUpdatedAtIso = savedPost.updatedAt.toISOString();
    console.log('[createPost] Saved post ID:', savedPost.id);
    try {
        await driver.executeQuery(`MERGE (u:User {id: $userId})
             MERGE (p:Post {id: $postId})
             ON CREATE SET p.createdAt = datetime($createdAt), p.authorId = $userId
             SET p.updatedAt = datetime($updatedAt),
                 p.authorId = coalesce(p.authorId, $userId)
             MERGE (u)-[:POSTED]->(p)`, { userId: author.id, postId: savedPost.id, createdAt: postCreatedAtIso, updatedAt: postUpdatedAtIso });
        if (parent) {
            await driver.executeQuery(`MERGE (child:Post {id: $childId})
                 MERGE (parent:Post {id: $parentId})
                 MERGE (child)-[:REPLY_TO]->(parent)`, { childId: savedPost.id, parentId: parent.id });
        }
        // Adicionar relações de atividades no Neo4j (opcional, para consultas futuras)
        if (workoutActivities.length > 0) {
            await driver.executeQuery(`UNWIND $activityIds AS activityId
                 MERGE (p:Post {id: $postId})
                 MERGE (a:WorkoutActivity {id: activityId})
                 MERGE (p)-[:CONTAINS_WORKOUT]->(a)`, { postId: savedPost.id, activityIds: workoutActivities.map(a => a.id) });
        }
        // Sincroniza hashtags no Neo4j
        if (hashtags.length > 0) {
            await syncHashtagsToNeo4j(savedPost.id, hashtags, author.id, {
                postCreatedAt: savedPost.createdAt,
                postUpdatedAt: savedPost.updatedAt
            });
        }
    }
    catch (error) {
        console.warn("Failed to mirror post graph relation", error);
    }
    // Processa menções (cria registros de Mention e Notification)
    // Executa em background para não bloquear a resposta
    processMentions(savedPost.id, content, author.id).catch(err => console.error(`Failed to process mentions for post ${savedPost.id}`, err));
    const savedWithRelations = await postRepository.findOne({
        where: { id: savedPost.id },
        relations: [
            "author",
            "parent",
            "comments",
            "likes",
            "likes.user",
            "workoutActivities",
            "hashtags"
        ]
    });
    return savedWithRelations ?? undefined;
};
//# sourceMappingURL=create-post.js.map