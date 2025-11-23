describe('Recommendation Service', () => {
    let recommendPosts: any;
    let recommendUsers: any;
    let mockPostRepo: any;
    let mockUserRepo: any;
    let mockDriver: any;

    beforeEach(() => {
        jest.resetModules();

        mockPostRepo = {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        mockUserRepo = {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        mockDriver = {
            executeQuery: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn((entity: any) => {
                    if (entity.name === 'Post') return mockPostRepo;
                    if (entity.name === 'User') return mockUserRepo;
                    return mockPostRepo;
                }),
            },
        }));

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: mockDriver,
        }));

        jest.doMock('neo4j-driver', () => ({
            default: {
                int: (n: number) => n,
            },
            int: (n: number) => n,
        }));

        jest.doMock('typeorm', () => ({
            In: jest.fn((arr) => arr),
        }));

        const recommendationModule = require('../recommendation-service');
        recommendPosts = recommendationModule.recommendPosts;
        recommendUsers = recommendationModule.recommendUsers;
    });

    describe('recommendPosts', () => {
        it('should recommend posts based on user interests', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            postId: 'post-123',
                            score: 0.85,
                            reasons: ['liked by followed users', 'trending hashtag'],
                        };
                        return data[key];
                    }),
                },
            ];

            mockDriver.executeQuery.mockResolvedValue({ records: mockRecords });

            const mockPosts = [
                {
                    id: 'post-123',
                    content: 'Great post',
                    author: { id: 'author-123' },
                },
            ];

            mockPostRepo.createQueryBuilder = jest.fn(() => ({
                whereInIds: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockPosts),
            }));

            const result = await recommendPosts('user-123');

            expect(result).toHaveLength(1);
            expect(result[0].post).toBeDefined();
            expect(result[0].score).toBeDefined();
        });

        it('should fall back to popular posts on error', async () => {
            mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            const mockPosts = [
                {
                    id: 'post-456',
                    content: 'Popular post',
                    likes: [{}, {}, {}],
                },
            ];

            mockPostRepo.find.mockResolvedValue(mockPosts);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await recommendPosts('user-123');

            expect(result).toBeDefined();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should respect limit parameter', async () => {
            mockDriver.executeQuery.mockResolvedValue({ records: [] });
            mockPostRepo.find.mockResolvedValue([]);

            await recommendPosts('user-123', 5);

            expect(mockDriver.executeQuery).toHaveBeenCalled();
        });
    });

    describe('recommendUsers', () => {
        it('should recommend users based on shared interests', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            userId: 'user-456',
                            score: 0.75,
                            reasons: ['shared hashtags'],
                            sharedHashtags: ['football', 'soccer'],
                        };
                        return data[key];
                    }),
                },
            ];

            mockDriver.executeQuery.mockResolvedValue({ records: mockRecords });

            const mockUsers = [
                {
                    id: 'user-456',
                    name: 'Similar User',
                    email: 'user@example.com',
                },
            ];

            mockUserRepo.createQueryBuilder = jest.fn(() => ({
                whereInIds: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockUsers),
            }));

            const result = await recommendUsers('user-123');

            expect(result).toHaveLength(1);
            expect(result[0].user).toBeDefined();
            expect(result[0].score).toBeDefined();
            expect(result[0].sharedHashtags).toBeDefined();
        });

        it('should fall back to popular users on error', async () => {
            mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            mockUserRepo.findOne.mockResolvedValue({
                id: 'user-123',
                following: [],
            });

            const mockUsers = [
                {
                    id: 'user-789',
                    name: 'Popular User',
                    followers: [{}, {}, {}],
                },
            ];

            mockUserRepo.createQueryBuilder = jest.fn(() => ({
                where: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockUsers),
            }));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await recommendUsers('user-123');

            expect(result).toBeDefined();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle empty recommendations', async () => {
            mockDriver.executeQuery.mockResolvedValue({ records: [] });
            mockUserRepo.findOne.mockResolvedValue({ id: 'user-123', following: [] });
            mockUserRepo.createQueryBuilder = jest.fn(() => ({
                where: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            }));

            const result = await recommendUsers('user-123');

            expect(result).toEqual([]);
        });
    });
});
