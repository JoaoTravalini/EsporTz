describe('Mention Service', () => {
    let extractMentions: any;
    let isValidUsername: any;
    let processMentions: any;
    let searchUsers: any;
    let mockMentionRepo: any;
    let mockUserRepo: any;
    let mockNotificationRepo: any;

    beforeEach(() => {
        jest.resetModules();

        mockMentionRepo = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
        };

        mockUserRepo = {
            find: jest.fn(),
        };

        mockNotificationRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn((entity: any) => {
                    if (entity.name === 'Mention') return mockMentionRepo;
                    if (entity.name === 'User') return mockUserRepo;
                    if (entity.name === 'Notification') return mockNotificationRepo;
                    return mockMentionRepo;
                }),
            },
        }));

        jest.doMock('typeorm', () => ({
            ILike: jest.fn((pattern) => pattern),
            In: jest.fn((arr) => arr),
        }));

        const mentionServiceModule = require('../mention-service');
        extractMentions = mentionServiceModule.extractMentions;
        isValidUsername = mentionServiceModule.isValidUsername;
        processMentions = mentionServiceModule.processMentions;
        searchUsers = mentionServiceModule.searchUsers;
    });

    describe('extractMentions', () => {
        it('should extract mentions from content', () => {
            const content = 'Hey @john_doe and @jane_smith, check this out!';
            const result = extractMentions(content);

            expect(result).toEqual(['john_doe', 'jane_smith']);
        });

        it('should return empty array for content without mentions', () => {
            const content = 'This is a post without mentions';
            const result = extractMentions(content);

            expect(result).toEqual([]);
        });

        it('should remove duplicate mentions', () => {
            const content = '@john mentioned @john again and @JOHN';
            const result = extractMentions(content);

            expect(result).toEqual(['john']);
        });

        it('should limit to 10 mentions', () => {
            const content = Array.from({ length: 15 }, (_, i) => `@user${i}`).join(' ');
            const result = extractMentions(content);

            expect(result).toHaveLength(10);
        });

        it('should handle empty content', () => {
            const result = extractMentions('');
            expect(result).toEqual([]);
        });

        it('should normalize usernames to lowercase', () => {
            const content = '@JohnDoe @JANEDOE @bobSmith';
            const result = extractMentions(content);

            expect(result).toEqual(['johndoe', 'janedoe', 'bobsmith']);
        });

        it('should handle mentions with underscores and hyphens', () => {
            const content = '@john_doe @jane-smith @bob_123';
            const result = extractMentions(content);

            expect(result).toEqual(['john_doe', 'jane-smith', 'bob_123']);
        });
    });

    describe('isValidUsername', () => {
        it('should validate correct usernames', () => {
            expect(isValidUsername('john')).toBe(true);
            expect(isValidUsername('john_doe')).toBe(true);
            expect(isValidUsername('jane-smith')).toBe(true);
            expect(isValidUsername('user123')).toBe(true);
        });

        it('should reject empty username', () => {
            expect(isValidUsername('')).toBe(false);
        });

        it('should reject username longer than 50 characters', () => {
            expect(isValidUsername('a'.repeat(51))).toBe(false);
        });

        it('should reject username with invalid characters', () => {
            expect(isValidUsername('john@doe')).toBe(false);
            expect(isValidUsername('jane.smith')).toBe(false);
            expect(isValidUsername('bob doe')).toBe(false);
        });
    });

    describe('processMentions', () => {
        it('should process mentions and create records', async () => {
            const content = 'Hey @john and @jane!';
            const users = [
                { id: 'user-1', name: 'john', email: 'john@example.com', imgURL: null },
                { id: 'user-2', name: 'jane', email: 'jane@example.com', imgURL: null },
            ];

            mockUserRepo.find.mockResolvedValue(users);
            mockMentionRepo.create.mockImplementation((data:any) => data);
            mockMentionRepo.save.mockResolvedValue([]);
            mockNotificationRepo.create.mockImplementation((data:any) => data);
            mockNotificationRepo.save.mockResolvedValue([]);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await processMentions('post-123', content, 'author-123');

            expect(mockMentionRepo.save).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Created 2 mentions')
            );

            consoleSpy.mockRestore();
        });

        it('should not create mention notifications for self-mentions', async () => {
            const content = 'Hey @john!';
            const users = [
                { id: 'author-123', name: 'john', email: 'john@example.com', imgURL: null },
            ];

            mockUserRepo.find.mockResolvedValue(users);
            mockMentionRepo.create.mockImplementation((data:any) => data);
            mockMentionRepo.save.mockResolvedValue([]);

            await processMentions('post-123', content, 'author-123');

            expect(mockNotificationRepo.create).not.toHaveBeenCalled();
        });

        it('should handle no mentions found', async () => {
            const content = 'This is a post without mentions';

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await processMentions('post-123', content, 'author-123');

            expect(mockUserRepo.find).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('No mentions found')
            );

            consoleSpy.mockRestore();
        });

        it('should handle no users found for mentions', async () => {
            const content = 'Hey @nonexistent!';

            mockUserRepo.find.mockResolvedValue([]);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await processMentions('post-123', content, 'author-123');

            expect(mockMentionRepo.create).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('No users found for mentions')
            );

            consoleSpy.mockRestore();
        });

        it('should handle errors gracefully', async () => {
            const content = 'Hey @john!';

            mockUserRepo.find.mockRejectedValue(new Error('Database error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await processMentions('post-123', content, 'author-123');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to process mentions'),
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('searchUsers', () => {
        it('should search users by query', async () => {
            const users = [
                { id: 'user-1', name: 'john doe', email: 'john@example.com', imgURL: null },
                { id: 'user-2', name: 'johnny', email: 'johnny@example.com', imgURL: null },
            ];

            mockUserRepo.find.mockResolvedValue(users);

            const result = await searchUsers('john');

            expect(result).toEqual(users);
            expect(mockUserRepo.find).toHaveBeenCalled();
        });

        it('should return empty array for empty query', async () => {
            const result = await searchUsers('');

            expect(result).toEqual([]);
            expect(mockUserRepo.find).not.toHaveBeenCalled();
        });

        it('should limit results to specified limit', async () => {
            const users = Array.from({ length: 5 }, (_, i) => ({
                id: `user-${i}`,
                name: `user${i}`,
                email: `user${i}@example.com`,
                imgURL: null,
            }));

            mockUserRepo.find.mockResolvedValue(users);

            await searchUsers('user', 5);

            expect(mockUserRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 5,
                })
            );
        });

        it('should handle query too short', async () => {
            const result = await searchUsers('');

            expect(result).toEqual([]);
        });
    });
});
