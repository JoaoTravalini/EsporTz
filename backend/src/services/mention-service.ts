import { AppDataSource } from "../database/postgres/data-source.js";
import { Mention } from "../database/postgres/entities/mention-entity.js";
import { User } from "../database/postgres/entities/user-entity.js";
import { Notification, NotificationType } from "../database/postgres/entities/notification-entity.js";
import { ILike, In } from "typeorm";

const mentionRepository = AppDataSource.getRepository(Mention);
const userRepository = AppDataSource.getRepository(User);
const notificationRepository = AppDataSource.getRepository(Notification);

/**
 * Regex para detectar menções: @username (alfanumérico, _, -)
 * Máximo 50 caracteres por username
 */
const MENTION_REGEX = /@([a-zA-Z0-9_-]{1,50})/g;
const MAX_MENTIONS_PER_POST = 10;

/**
 * Extrai menções do conteúdo do post
 * Remove duplicatas e limita a 10 menções
 */
export function extractMentions(content: string): string[] {
    if (!content) return [];

    const matches = content.matchAll(MENTION_REGEX);
    const usernames = new Set<string>();

    for (const match of matches) {
        const username = match[1]!.toLowerCase();
        if (username.length > 0 && username.length <= 50) {
            usernames.add(username);
        }
    }

    // Limita a 10 menções
    return Array.from(usernames).slice(0, MAX_MENTIONS_PER_POST);
}

/**
 * Valida se um username é válido
 */
export function isValidUsername(username: string): boolean {
    if (!username || username.length === 0 || username.length > 50) {
        return false;
    }

    // Apenas alfanuméricos, underscore e hífen
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(username);
}

/**
 * Extrai contexto ao redor da menção (20 caracteres antes e depois)
 */
function extractContext(content: string, username: string): string {
    const searchPattern = `@${username}`;
    const index = content.toLowerCase().indexOf(searchPattern.toLowerCase());
    
    if (index === -1) return '';
    
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + searchPattern.length + 20);
    
    return content.substring(start, end);
}

/**
 * Busca usuários por username (busca no campo name e email)
 * Retorna usuários que correspondem aos usernames mencionados
 */
async function findUsersByUsernames(usernames: string[]): Promise<User[]> {
    if (usernames.length === 0) return [];

    // Busca por nome ou email que contenha o username
    const users = await userRepository.find({
        where: usernames.flatMap(username => [
            { name: ILike(`%${username}%`) },
            { email: ILike(`${username}%`) }
        ]),
        select: ['id', 'name', 'email', 'imgURL']
    });

    return users;
}

/**
 * Processa menções após criação/edição de post
 * Cria registros de Mention e Notification
 */
export async function processMentions(
    postId: string,
    content: string,
    authorId: string
): Promise<void> {
    try {
        const usernames = extractMentions(content);
        
        if (usernames.length === 0) {
            console.log(`No mentions found in post ${postId}`);
            return;
        }

        // Buscar usuários mencionados
        const users = await findUsersByUsernames(usernames);
        
        if (users.length === 0) {
            console.log(`No users found for mentions in post ${postId}`);
            return;
        }

        // Criar registros de menção
        const mentions = users.map((user, index) => 
            mentionRepository.create({
                postId,
                mentionedUserId: user.id,
                position: index,
                context: extractContext(content, user.name)
            })
        );

        await mentionRepository.save(mentions);
        console.log(`✅ Created ${mentions.length} mentions for post ${postId}`);

        // Criar notificações (exceto para auto-menções)
        await createMentionNotifications(
            users.filter(u => u.id !== authorId),
            postId,
            authorId
        );
    } catch (error) {
        console.error(`❌ Failed to process mentions for post ${postId}:`, error);
        // Não lança erro para não bloquear a criação do post
    }
}

/**
 * Cria notificações para usuários mencionados
 * Filtra auto-menções
 */
export async function createMentionNotifications(
    mentionedUsers: User[],
    postId: string,
    actorId: string
): Promise<void> {
    if (mentionedUsers.length === 0) return;

    try {
        const notifications = mentionedUsers.map(user =>
            notificationRepository.create({
                recipientId: user.id,
                actorId,
                type: NotificationType.MENTION,
                postId,
                read: false
            })
        );

        await notificationRepository.save(notifications);
        console.log(`✅ Created ${notifications.length} mention notifications`);
    } catch (error) {
        console.error('❌ Failed to create mention notifications:', error);
    }
}

/**
 * Busca usuários para autocompletar
 * Busca por nome e email
 */
export async function searchUsers(query: string, limit: number = 10): Promise<User[]> {
    if (!query || query.length < 1) {
        return [];
    }

    const normalizedQuery = query.toLowerCase();

    const users = await userRepository.find({
        where: [
            { name: ILike(`%${normalizedQuery}%`) },
            { email: ILike(`${normalizedQuery}%`) }
        ],
        take: limit,
        select: ['id', 'name', 'email', 'imgURL']
    });

    return users;
}

/**
 * Atualiza menções quando post é editado
 * Remove menções antigas e cria novas
 */
export async function updateMentions(
    postId: string,
    newContent: string,
    authorId: string
): Promise<void> {
    try {
        // Remove menções antigas
        await mentionRepository.delete({ postId });
        console.log(`✅ Removed old mentions for post ${postId}`);

        // Processa novas menções
        await processMentions(postId, newContent, authorId);
    } catch (error) {
        console.error(`❌ Failed to update mentions for post ${postId}:`, error);
    }
}

/**
 * Busca menções de um post
 */
export async function getPostMentions(postId: string): Promise<Mention[]> {
    return mentionRepository.find({
        where: { postId },
        relations: ['mentionedUser'],
        order: { position: 'ASC' }
    });
}

/**
 * Busca posts onde um usuário foi mencionado
 */
export async function getUserMentions(
    userId: string,
    page: number = 1,
    limit: number = 20
): Promise<{ mentions: Mention[]; total: number }> {
    const skip = (page - 1) * limit;

    const [mentions, total] = await mentionRepository.findAndCount({
        where: { mentionedUserId: userId },
        relations: ['post', 'post.author'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit
    });

    return { mentions, total };
}
