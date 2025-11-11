import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { Hashtag } from "../database/postgres/entities/hashtag-entity.js";
import { Post } from "../database/postgres/entities/post-entity.js";
import { In } from "typeorm";

const hashtagRepository = AppDataSource.getRepository(Hashtag);
const postRepository = AppDataSource.getRepository(Post);

/**
 * Extrai hashtags de um texto
 * Regex: # seguido de caracteres alfanuméricos e underscore
 * Máximo 50 caracteres por hashtag
 */
export function extractHashtags(content: string): string[] {
    if (!content) return [];

    // Regex para encontrar hashtags: # seguido de letras, números e underscore
    const hashtagRegex = /#(\w{1,50})/g;
    const matches = content.matchAll(hashtagRegex);
    
    const hashtags = new Set<string>();
    
    for (const match of matches) {
        const tag = match[1]!.toLowerCase(); // Normaliza para lowercase
        if (tag!.length > 0 && tag.length <= 50) {
            hashtags.add(tag);
        }
    }
    
    return Array.from(hashtags);
}

/**
 * Valida se uma hashtag é válida
 */
export function isValidHashtag(tag: string): boolean {
    if (!tag || tag.length === 0 || tag.length > 50) {
        return false;
    }
    
    // Apenas alfanuméricos e underscore
    const validPattern = /^[\w]+$/;
    return validPattern.test(tag);
}

/**
 * Extrai a capitalização original de uma hashtag do texto
 */
function extractDisplayTag(content: string, tag: string): string {
    const regex = new RegExp(`#(${tag})`, 'gi');
    const match = content.match(regex);
    
    if (match && match[0]) {
        return match[0].substring(1); // Remove o #
    }
    
    return tag;
}

/**
 * Cria ou atualiza hashtags no PostgreSQL
 * Retorna as entidades Hashtag
 */
export async function upsertHashtags(tags: string[], content: string): Promise<Hashtag[]> {
    if (tags.length === 0) return [];
    
    const hashtags: Hashtag[] = [];
    
    for (const tag of tags) {
        if (!isValidHashtag(tag)) {
            console.warn(`Invalid hashtag skipped: ${tag}`);
            continue;
        }
        
        // Busca hashtag existente
        let hashtag = await hashtagRepository.findOne({ where: { tag } });
        
        if (hashtag) {
            // Atualiza contagem e data de último uso
            hashtag.postCount += 1;
            hashtag.lastUsedAt = new Date();
            await hashtagRepository.save(hashtag);
        } else {
            // Cria nova hashtag
            const displayTag = extractDisplayTag(content, tag);
            hashtag = hashtagRepository.create({
                tag,
                displayTag,
                postCount: 1,
                lastUsedAt: new Date()
            });
            await hashtagRepository.save(hashtag);
        }
        
        hashtags.push(hashtag);
    }
    
    return hashtags;
}

/**
 * Sincroniza hashtags no Neo4j
 * Cria nós Hashtag e relacionamentos HAS_TAG e USED_TAG
 */
export async function syncHashtagsToNeo4j(
    postId: string,
    hashtags: Hashtag[],
    userId: string
): Promise<void> {
    if (hashtags.length === 0) return;
    
    try {
        // Cria nós Hashtag e relacionamentos HAS_TAG
        await driver.executeQuery(
            `UNWIND $hashtags AS hashtagData
             MERGE (h:Hashtag {tag: hashtagData.tag})
             ON CREATE SET h.displayTag = hashtagData.displayTag
             
             MERGE (p:Post {id: $postId})
             MERGE (p)-[:HAS_TAG]->(h)`,
            {
                postId,
                hashtags: hashtags.map(h => ({
                    tag: h.tag,
                    displayTag: h.displayTag
                }))
            }
        );
        
        // Cria/atualiza relacionamentos USED_TAG entre User e Hashtag
        await driver.executeQuery(
            `UNWIND $hashtags AS hashtagData
             MERGE (u:User {id: $userId})
             MERGE (h:Hashtag {tag: hashtagData.tag})
             
             MERGE (u)-[ut:USED_TAG]->(h)
             ON CREATE SET ut.count = 1, ut.lastUsedAt = datetime()
             ON MATCH SET ut.count = ut.count + 1, ut.lastUsedAt = datetime()`,
            {
                userId,
                hashtags: hashtags.map(h => ({
                    tag: h.tag,
                    displayTag: h.displayTag
                }))
            }
        );
        
        console.log(`✅ Synced ${hashtags.length} hashtags to Neo4j for post ${postId}`);
    } catch (error) {
        console.error("❌ Failed to sync hashtags to Neo4j:", error);
        // Não lança erro para não bloquear a criação do post
    }
}

/**
 * Busca posts por hashtag
 */
export async function getPostsByHashtag(
    tag: string,
    limit: number = 20,
    offset: number = 0
): Promise<Post[]> {
    const normalizedTag = tag.toLowerCase();
    
    const hashtag = await hashtagRepository.findOne({
        where: { tag: normalizedTag },
        relations: ["posts"]
    });
    
    if (!hashtag) {
        return [];
    }
    
    // Busca posts com todas as relações necessárias
    const posts = await postRepository
        .createQueryBuilder("post")
        .innerJoin("post.hashtags", "hashtag")
        .where("hashtag.tag = :tag", { tag: normalizedTag })
        .leftJoinAndSelect("post.author", "author")
        .leftJoinAndSelect("post.likes", "likes")
        .leftJoinAndSelect("likes.user", "likeUser")
        .leftJoinAndSelect("post.comments", "comments")
        .leftJoinAndSelect("comments.author", "commentAuthor")
        .leftJoinAndSelect("post.hashtags", "postHashtags")
        .leftJoinAndSelect("post.workoutActivities", "workoutActivities")
        .orderBy("post.createdAt", "DESC")
        .skip(offset)
        .take(limit)
        .getMany();
    
    return posts;
}

/**
 * Busca hashtags por padrão (para autocomplete)
 */
export async function searchHashtags(
    query: string,
    limit: number = 10
): Promise<Hashtag[]> {
    const normalizedQuery = query.toLowerCase().replace('#', '');
    
    if (normalizedQuery.length === 0) {
        // Retorna hashtags mais populares
        return hashtagRepository.find({
            order: { postCount: "DESC" },
            take: limit
        });
    }
    
    // Busca por padrão
    const hashtags = await hashtagRepository
        .createQueryBuilder("hashtag")
        .where("hashtag.tag LIKE :query", { query: `%${normalizedQuery}%` })
        .orderBy("hashtag.postCount", "DESC")
        .take(limit)
        .getMany();
    
    return hashtags;
}

/**
 * Decrementa a contagem de posts de uma hashtag
 * Usado quando um post é deletado
 */
export async function decrementHashtagCount(hashtagIds: string[]): Promise<void> {
    if (hashtagIds.length === 0) return;
    
    const hashtags = await hashtagRepository.find({
        where: { id: In(hashtagIds) }
    });
    
    for (const hashtag of hashtags) {
        if (hashtag.postCount > 0) {
            hashtag.postCount -= 1;
            await hashtagRepository.save(hashtag);
        }
    }
}
