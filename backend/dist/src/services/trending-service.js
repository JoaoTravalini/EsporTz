import neo4j from "neo4j-driver";
import { driver } from "../database/neo4j/data-source.js";
// Cache em memória para trending hashtags
let trendingCache = new Map();
let lastCacheUpdate = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos
/**
 * Retorna hashtags em alta
 */
export async function getTrendingHashtags(timeWindow = '24h', limit = 10) {
    // Verifica se tem cache válido
    const cacheKey = `${timeWindow}_${limit}`;
    const cached = trendingCache.get(cacheKey);
    if (cached && lastCacheUpdate && (Date.now() - lastCacheUpdate.getTime()) < CACHE_TTL_MS) {
        console.log(`[getTrendingHashtags] Using cached results for ${timeWindow}`);
        return cached;
    }
    // Calcula trending do Neo4j
    try {
        const trending = await calculateTrending(timeWindow, limit);
        // Atualiza cache
        trendingCache.set(cacheKey, trending);
        lastCacheUpdate = new Date();
        return trending;
    }
    catch (error) {
        console.error("[getTrendingHashtags] Error calculating trending:", error);
        // Retorna cache antigo se disponível
        if (cached) {
            console.log("[getTrendingHashtags] Returning stale cache due to error");
            return cached;
        }
        return [];
    }
}
/**
 * Calcula trending hashtags do Neo4j
 */
async function calculateTrending(timeWindow, limit) {
    // Converte time window para duration do Neo4j
    const durationMap = {
        '1h': 'PT1H',
        '24h': 'P1D',
        '7d': 'P7D'
    };
    const duration = durationMap[timeWindow];
    // Calcula período anterior para comparação de crescimento
    const previousDurationMap = {
        '1h': 'PT2H',
        '24h': 'P2D',
        '7d': 'P14D'
    };
    const previousDuration = previousDurationMap[timeWindow];
    const result = await driver.executeQuery(`// Calcula hashtags em alta no período atual
         MATCH (tag:Hashtag)<-[:HAS_TAG]-(post:Post)
         WHERE post.createdAt > datetime() - duration($duration)

         WITH tag, count(DISTINCT post) as postCount, 
              count(DISTINCT post.authorId) as userCount

         // Compara com período anterior para calcular crescimento
         OPTIONAL MATCH (tag)<-[:HAS_TAG]-(oldPost:Post)
         WHERE oldPost.createdAt > datetime() - duration($previousDuration)
           AND oldPost.createdAt <= datetime() - duration($duration)

         WITH tag, postCount, userCount, count(DISTINCT oldPost) as postCountPrevious

         WITH tag, postCount, userCount,
              CASE 
                WHEN postCountPrevious > 0 
                THEN toFloat(postCount - postCountPrevious) / postCountPrevious * 100
                ELSE 100.0
              END as growthRate

         RETURN tag.tag as tag, 
                tag.displayTag as displayTag,
                postCount,
                userCount,
                growthRate,
                growthRate > 50.0 as isTrending
         ORDER BY postCount DESC, growthRate DESC
         LIMIT $limit`, {
        duration,
        previousDuration,
        limit: neo4j.int(limit)
    });
    const trending = result.records.map(record => ({
        tag: record.get('tag'),
        displayTag: record.get('displayTag'),
        postCount: record.get('postCount')?.toNumber() || 0,
        userCount: record.get('userCount')?.toNumber() || 0,
        growthRate: record.get('growthRate'),
        isTrending: record.get('isTrending')
    }));
    return trending;
}
/**
 * Atualiza cache de trending (chamado pelo background job)
 */
export async function updateTrendingCache() {
    console.log("🔄 Updating trending hashtags cache...");
    try {
        // Atualiza cache para todas as janelas de tempo
        const timeWindows = ['1h', '24h', '7d'];
        const limits = [10, 20];
        for (const timeWindow of timeWindows) {
            for (const limit of limits) {
                const cacheKey = `${timeWindow}_${limit}`;
                const trending = await calculateTrending(timeWindow, limit);
                trendingCache.set(cacheKey, trending);
                console.log(`✅ Updated cache for ${timeWindow} (limit: ${limit}): ${trending.length} hashtags`);
            }
        }
        lastCacheUpdate = new Date();
        console.log("✅ Trending cache update completed");
    }
    catch (error) {
        console.error("❌ Error updating trending cache:", error);
        throw error;
    }
}
/**
 * Limpa o cache (útil para testes)
 */
export function clearTrendingCache() {
    trendingCache.clear();
    lastCacheUpdate = null;
    console.log("🗑️  Trending cache cleared");
}
//# sourceMappingURL=trending-service.js.map