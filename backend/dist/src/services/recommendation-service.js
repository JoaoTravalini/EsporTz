import neo4j from "neo4j-driver";
import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { Post } from "../database/postgres/entities/post-entity.js";
import { User } from "../database/postgres/entities/user-entity.js";
import { In } from "typeorm";
const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);
/**
 * Recomenda posts para um usuário baseado em múltiplos fatores
 */
export async function recommendPosts(userId, limit = 10) {
    try {
        // Query Neo4j para recomendações de posts
        const result = await driver.executeQuery(`MATCH (me:User {id: $userId})

             // Fator 1: Posts com hashtags que eu uso frequentemente
             OPTIONAL MATCH (me)-[ut:USED_TAG]->(tag:Hashtag)<-[:HAS_TAG]-(post1:Post)
             WHERE NOT (me)-[:POSTED]->(post1)
               AND NOT (me)-[:LIKED]->(post1)
               AND post1.createdAt > datetime() - duration('P7D')
             WITH me, post1, sum(ut.count) as hashtagScore

             // Fator 2: Posts curtidos por pessoas que eu sigo
             OPTIONAL MATCH (me)-[:FOLLOWS]->(friend:User)-[:LIKED]->(post2:Post)
             WHERE NOT (me)-[:POSTED]->(post2)
               AND NOT (me)-[:LIKED]->(post2)
               AND post2.createdAt > datetime() - duration('P7D')
             WITH me, post1, hashtagScore, post2, count(friend) as friendLikeScore

             // Fator 3: Posts de usuários similares
             OPTIONAL MATCH (me)-[sim:SIMILAR_TO]->(similar:User)-[:POSTED]->(post3:Post)
             WHERE NOT (me)-[:LIKED]->(post3)
               AND post3.createdAt > datetime() - duration('P7D')
             WITH post1, hashtagScore, post2, friendLikeScore, post3, sim.score as similarityScore

             // Combina todos os posts e calcula score final
             WITH collect({post: post1, score: hashtagScore * 2.0, reason: 'shared_hashtag'}) + 
                  collect({post: post2, score: friendLikeScore * 1.5, reason: 'liked_by_following'}) +
                  collect({post: post3, score: similarityScore * 1.0, reason: 'similar_user'}) as allPosts

             UNWIND allPosts as postData
             WITH postData.post as post, sum(postData.score) as finalScore, collect(DISTINCT postData.reason) as reasons
             WHERE post IS NOT NULL

             RETURN DISTINCT post.id as postId, finalScore, reasons
             ORDER BY finalScore DESC, post.createdAt DESC
             LIMIT $limit`, { userId, limit: neo4j.int(limit) });
        if (result.records.length === 0) {
            console.log(`[recommendPosts] No recommendations found for user ${userId}, using fallback`);
            return getPopularRecentPosts(limit);
        }
        // Extrai IDs dos posts recomendados
        const recommendations = result.records.map(record => ({
            postId: record.get('postId'),
            score: record.get('finalScore'),
            reasons: record.get('reasons')
        }));
        // Busca posts completos do PostgreSQL
        const postIds = recommendations.map(r => r.postId);
        const posts = await postRepository.find({
            where: { id: In(postIds) },
            relations: [
                "author",
                "likes",
                "likes.user",
                "comments",
                "comments.author",
                "hashtags",
                "workoutActivities"
            ]
        });
        // Mapeia posts com scores e reasons
        const postMap = new Map(posts.map(p => [p.id, p]));
        const postRecommendations = recommendations
            .map(rec => {
            const post = postMap.get(rec.postId);
            if (!post)
                return null;
            return {
                post,
                score: rec.score,
                reasons: rec.reasons
            };
        })
            .filter((r) => r !== null);
        return postRecommendations;
    }
    catch (error) {
        console.error("[recommendPosts] Error getting recommendations from Neo4j:", error);
        // Fallback: retorna posts populares recentes
        return getPopularRecentPosts(limit);
    }
}
/**
 * Fallback: retorna posts populares recentes
 */
async function getPopularRecentPosts(limit) {
    const posts = await postRepository
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.author", "author")
        .leftJoinAndSelect("post.likes", "likes")
        .leftJoinAndSelect("likes.user", "likeUser")
        .leftJoinAndSelect("post.comments", "comments")
        .leftJoinAndSelect("comments.author", "commentAuthor")
        .leftJoinAndSelect("post.hashtags", "hashtags")
        .leftJoinAndSelect("post.workoutActivities", "workoutActivities")
        .where("post.createdAt > :date", {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
    })
        .orderBy("likes.id", "DESC")
        .addOrderBy("post.createdAt", "DESC")
        .take(limit)
        .getMany();
    return posts.map(post => ({
        post,
        score: post.likes?.length || 0,
        reasons: ['popular']
    }));
}
/**
 * Recomenda usuários para seguir baseado em interesses compartilhados
 */
export async function recommendUsers(userId, limit = 5) {
    try {
        console.log(`🔍 [recommendUsers] Searching recommendations for user ${userId}`);
        // Verifica se o usuário existe no Neo4j e quem ele segue
        const checkUser = await driver.executeQuery(`MATCH (me:User {id: $userId})
             OPTIONAL MATCH (me)-[:FOLLOWS]->(following:User)
             RETURN me.id as userId, count(following) as followingCount, collect(following.id) as followingIds`, { userId });
        if (checkUser.records.length > 0) {
            const record = checkUser.records[0];
            const followingCount = record.get('followingCount')?.toNumber() || 0;
            const followingIds = record.get('followingIds') || [];
            console.log(`📊 [recommendUsers] User ${userId} follows ${followingCount} users in Neo4j:`, followingIds);
        }
        else {
            console.log(`⚠️ [recommendUsers] User ${userId} not found in Neo4j, using fallback`);
            return getPopularUsers(userId, limit);
        }
        // Query Neo4j para recomendações de usuários
        const result = await driver.executeQuery(`MATCH (me:User {id: $userId})

             // Fator 1: Usuários que usam hashtags similares
             OPTIONAL MATCH (me)-[myTag:USED_TAG]->(tag:Hashtag)<-[theirTag:USED_TAG]-(user1:User)
             WHERE user1.id <> $userId
               AND NOT (me)-[:FOLLOWS]->(user1)
             WITH me, user1, sum(myTag.count * theirTag.count) as hashtagSimilarity, collect(tag.tag) as sharedTags

             // Fator 2: Usuários que curtiram posts similares
             OPTIONAL MATCH (me)-[:LIKED]->(post:Post)<-[:LIKED]-(user2:User)
             WHERE user2.id <> $userId
               AND NOT (me)-[:FOLLOWS]->(user2)
             WITH me, user1, hashtagSimilarity, sharedTags, user2, count(post) as sharedLikes

             // Fator 3: Amigos de amigos
             OPTIONAL MATCH (me)-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(user3:User)
             WHERE user3.id <> $userId
               AND NOT (me)-[:FOLLOWS]->(user3)
             WITH user1, hashtagSimilarity, sharedTags, user2, sharedLikes, user3, count(friend) as mutualFriends

             // Combina scores
             WITH collect({user: user1, score: hashtagSimilarity * 3.0, reason: 'similar_hashtags', tags: sharedTags}) +
                  collect({user: user2, score: sharedLikes * 2.0, reason: 'shared_likes', tags: []}) +
                  collect({user: user3, score: mutualFriends * 1.5, reason: 'friend_of_friend', tags: []}) as allUsers

             UNWIND allUsers as userData
             WITH userData.user as user, sum(userData.score) as finalScore, 
                  collect(DISTINCT userData.reason) as reasons,
                  head(userData.tags) as sharedTags
             WHERE user IS NOT NULL

             RETURN DISTINCT user.id as userId, finalScore, reasons, sharedTags
             ORDER BY finalScore DESC
             LIMIT $limit`, { userId, limit: neo4j.int(limit) });
        if (result.records.length === 0) {
            console.log(`⚠️ [recommendUsers] No recommendations found in Neo4j for user ${userId}, using PostgreSQL fallback`);
            return getPopularUsers(userId, limit);
        }
        console.log(`✅ [recommendUsers] Found ${result.records.length} recommendations from Neo4j for user ${userId}`);
        // Extrai IDs dos usuários recomendados
        const recommendations = result.records.map(record => ({
            userId: record.get('userId'),
            score: record.get('finalScore'),
            reasons: record.get('reasons'),
            sharedTags: record.get('sharedTags') || []
        }));
        // Busca usuários completos do PostgreSQL
        const userIds = recommendations.map(r => r.userId);
        const users = await userRepository.find({
            where: { id: In(userIds) }
        });
        // Mapeia usuários com scores e reasons
        const userMap = new Map(users.map(u => [u.id, u]));
        const userRecommendations = recommendations
            .map(rec => {
            const user = userMap.get(rec.userId);
            if (!user)
                return null;
            return {
                user,
                score: rec.score,
                reasons: rec.reasons,
                sharedHashtags: rec.sharedTags.slice(0, 5) // Top 5 hashtags compartilhadas
            };
        })
            .filter((r) => r !== null);
        return userRecommendations;
    }
    catch (error) {
        console.error("❌ [recommendUsers] Error getting recommendations from Neo4j:", error);
        console.log("⚠️ [recommendUsers] Using PostgreSQL fallback due to Neo4j error");
        // Fallback: retorna usuários populares
        return getPopularUsers(userId, limit);
    }
}
/**
 * Fallback: retorna usuários populares que o usuário ainda não segue
 */
async function getPopularUsers(excludeUserId, limit) {
    // Busca o usuário atual com seus seguidos
    const currentUser = await userRepository.findOne({
        where: { id: excludeUserId },
        relations: ['following']
    });
    if (!currentUser) {
        return [];
    }
    // IDs dos usuários que já segue
    const followingIds = (currentUser.following || []).map(u => u.id);
    followingIds.push(excludeUserId); // Adiciona o próprio usuário para excluir
    // Busca usuários que NÃO estão na lista de seguidos
    const users = await userRepository
        .createQueryBuilder("user")
        .where("user.id NOT IN (:...excludeIds)", { excludeIds: followingIds })
        .orderBy("RANDOM()")
        .take(limit * 2) // Busca mais para ter opções
        .getMany();
    return users.slice(0, limit).map(user => ({
        user,
        score: 0,
        reasons: ['popular']
    }));
}
/**
 * Calcula similaridade entre usuários (background job)
 * Deve ser executado periodicamente
 */
export async function calculateUserSimilarity(userId) {
    try {
        const result = await driver.executeQuery(`MATCH (user:User {id: $userId})

             // Encontra usuários com interesses similares
             MATCH (user)-[myTag:USED_TAG]->(tag:Hashtag)<-[theirTag:USED_TAG]-(other:User)
             WHERE other.id <> $userId

             WITH user, other, 
                  sum(myTag.count * theirTag.count) as hashtagScore,
                  collect(tag.tag) as sharedTags

             // Adiciona score de likes compartilhados
             OPTIONAL MATCH (user)-[:LIKED]->(post:Post)<-[:LIKED]-(other)
             WITH user, other, hashtagScore, sharedTags, count(post) as sharedLikes

             // Calcula score final normalizado
             WITH user, other, sharedTags,
                  (hashtagScore * 0.6 + sharedLikes * 0.4) as rawScore

             // Normaliza score para 0-1
             WITH user, other, sharedTags, rawScore,
                  rawScore / (1.0 + rawScore) as normalizedScore

             WHERE normalizedScore > 0.1

             // Cria ou atualiza relacionamento SIMILAR_TO
             MERGE (user)-[sim:SIMILAR_TO]->(other)
             SET sim.score = normalizedScore,
                 sim.reason = substring(reduce(s = '', tag IN sharedTags[0..3] | s + tag + ','), 0, 100),
                 sim.updatedAt = datetime()

             RETURN count(sim) as similaritiesCreated`, { userId });
        const count = result.records[0]?.get('similaritiesCreated')?.toNumber() || 0;
        console.log(`✅ Calculated ${count} similarities for user ${userId}`);
    }
    catch (error) {
        console.error(`❌ Error calculating similarity for user ${userId}:`, error);
    }
}
//# sourceMappingURL=recommendation-service.js.map