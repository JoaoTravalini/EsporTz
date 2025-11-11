import neo4j from "neo4j-driver";
import { driver } from "../database/neo4j/data-source.js";
import { AppDataSource } from "../database/postgres/data-source.js";
import { User } from "../database/postgres/entities/user-entity.js";

const userRepository = AppDataSource.getRepository(User);

type GetUserSuggestionsParams = {
    userId: string;
    limit?: number;
};

/**
 * Busca sugestões de usuários para seguir baseado no grafo de relacionamentos do Neo4j.
 * 
 * Estratégia:
 * 1. Se o usuário não tem amigos/conexões, retorna usuários aleatórios
 * 2. Se o usuário tem amigos, retorna:
 *    - Amigos de amigos (2º grau)
 *    - Usuários populares que o usuário ainda não segue
 *    - Usuários aleatórios para completar a lista
 */
export const getUserSuggestions = async ({ 
    userId, 
    limit = 5 
}: GetUserSuggestionsParams): Promise<User[]> => {
    try {
        // Primeiro, verifica se o usuário tem conexões no Neo4j
        const connectionCheckResult = await driver.executeQuery(
            `MATCH (u:User {id: $userId})
             OPTIONAL MATCH (u)-[:FOLLOWS]->(following)
             RETURN count(following) as followingCount`,
            { userId }
        );

        const followingCount = connectionCheckResult.records[0]?.get('followingCount')?.toNumber() || 0;

        let suggestedUserIds: string[] = [];

        if (followingCount === 0) {
            // Usuário não tem amigos - retorna usuários aleatórios
            suggestedUserIds = await getRandomUserIds(userId, limit);
        } else {
            // Usuário tem amigos - busca sugestões inteligentes
            suggestedUserIds = await getSmartSuggestions(userId, limit);
        }

        // Busca os usuários completos do Postgres usando os IDs do Neo4j
        if (suggestedUserIds.length === 0) {
            return [];
        }

        // Valida que todos os IDs são UUIDs válidos
        const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const validUserIds = suggestedUserIds.filter(id => {
            const isValid = validUuidRegex.test(id);
            if (!isValid) {
                console.warn(`Invalid UUID from Neo4j: ${id}`);
            }
            return isValid;
        });

        if (validUserIds.length === 0) {
            console.warn("No valid UUIDs found from Neo4j, falling back to Postgres");
            return getRandomUsersFromPostgres(userId, limit);
        }

        const users = await userRepository
            .createQueryBuilder("user")
            .whereInIds(validUserIds)
            .getMany();

        // Mantém a ordem das sugestões
        const userMap = new Map(users.map(u => [u.id, u]));
        return validUserIds
            .map(id => userMap.get(id))
            .filter((u): u is User => u !== undefined);

    } catch (error) {
        console.error("Error getting user suggestions from Neo4j:", error);
        // Fallback: retorna usuários aleatórios do Postgres
        return getRandomUsersFromPostgres(userId, limit);
    }
};

/**
 * Busca IDs de usuários aleatórios do Neo4j
 */
async function getRandomUserIds(excludeUserId: string, limit: number): Promise<string[]> {
    try {
        const result = await driver.executeQuery(
            `MATCH (u:User)
             WHERE u.id <> $excludeUserId
             RETURN u.id as userId
             ORDER BY rand()
             LIMIT $limit`,
            { excludeUserId, limit: neo4j.int(limit) }
        );

        return result.records.map(record => {
            const userId = record.get('userId');
            // Log para debug
            if (typeof userId !== 'string') {
                console.warn(`Neo4j returned non-string userId: ${userId} (type: ${typeof userId})`);
            }
            // Garante que o valor é uma string
            return typeof userId === 'string' ? userId : String(userId);
        }).filter(id => {
            // Valida que é um UUID válido
            const isValid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
            if (!isValid) {
                console.warn(`Filtering out invalid UUID from Neo4j: ${id}`);
            }
            return isValid;
        });
    } catch (error) {
        console.error("Error getting random user IDs from Neo4j:", error);
        return [];
    }
}

/**
 * Busca sugestões inteligentes baseadas no grafo de relacionamentos
 */
async function getSmartSuggestions(userId: string, limit: number): Promise<string[]> {
    try {
        // Busca amigos de amigos e usuários populares
        const result = await driver.executeQuery(
            `MATCH (me:User {id: $userId})

             // Amigos de amigos (2º grau) - maior prioridade
             OPTIONAL MATCH (me)-[:FOLLOWS]->(friend)-[:FOLLOWS]->(fof:User)
             WHERE fof.id <> $userId
               AND NOT (me)-[:FOLLOWS]->(fof)
             WITH me, collect(DISTINCT fof) as friendsOfFriends

             // Usuários populares que eu não sigo
             OPTIONAL MATCH (popular:User)<-[:FOLLOWS]-(follower)
             WHERE popular.id <> $userId
               AND NOT (me)-[:FOLLOWS]->(popular)
             WITH friendsOfFriends, popular, count(follower) as popularity
             ORDER BY popularity DESC
             LIMIT 10
             WITH friendsOfFriends, collect(DISTINCT popular) as popularUsers

             // Combina amigos de amigos com usuários populares
             UNWIND (friendsOfFriends + popularUsers) as suggestion

             RETURN DISTINCT suggestion.id as userId
             LIMIT $limit`,
            { userId, limit: neo4j.int(limit) }
        );

        const suggestedIds = result.records.map(record => {
            const userId = record.get('userId');
            // Log para debug
            if (typeof userId !== 'string') {
                console.warn(`Neo4j returned non-string userId: ${userId} (type: ${typeof userId})`);
            }
            // Garante que o valor é uma string
            return typeof userId === 'string' ? userId : String(userId);
        }).filter(id => {
            // Valida que é um UUID válido
            const isValid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
            if (!isValid) {
                console.warn(`Filtering out invalid UUID from Neo4j: ${id}`);
            }
            return isValid;
        });

        // Se não encontrou sugestões suficientes, completa com usuários aleatórios
        if (suggestedIds.length < limit) {
            const randomIds = await getRandomUserIds(userId, limit - suggestedIds.length);
            return [...suggestedIds, ...randomIds];
        }

        return suggestedIds;
    } catch (error) {
        console.error("Error getting smart suggestions from Neo4j:", error);
        return getRandomUserIds(userId, limit);
    }
}

/**
 * Fallback: busca usuários aleatórios diretamente do Postgres
 */
async function getRandomUsersFromPostgres(excludeUserId: string, limit: number): Promise<User[]> {
    return userRepository
        .createQueryBuilder("user")
        .where("user.id != :excludeUserId", { excludeUserId })
        .orderBy("RANDOM()")
        .limit(limit)
        .getMany();
}

