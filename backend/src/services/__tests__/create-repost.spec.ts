describe('createRepost', () => {
    let createRepost: any;
    let mockPostRepo: any;
    let mockUserRepo: any;
    let mockDriver: any;
    let mockCreateQueryBuilder: any;

    beforeEach(() => {
        jest.resetModules();

        mockCreateQueryBuilder = {
            relation: jest.fn().mockReturnThis(),
            of: jest.fn().mockReturnThis(),
            add: jest.fn().mockResolvedValue(undefined),
        };

        mockPostRepo = {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => mockCreateQueryBuilder),
        };

        mockUserRepo = {
            findOne: jest.fn(),
        };

        mockDriver = {
            executeQuery: jest.fn().mockResolvedValue(undefined),
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

        const createRepostModule = require('../create-repost');
        createRepost = createRepostModule.createRepost;
    });

    it('should return undefined if post does not exist', async () => {
        mockPostRepo.findOne.mockResolvedValue(null);
        mockUserRepo.findOne.mockResolvedValue({ id: 'user-123' });

        const result = await createRepost({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(result).toBeUndefined();
    });

    it('should return undefined if user does not exist', async () => {
        mockPostRepo.findOne.mockResolvedValue({ id: 'post-456', repostedBy: [] });
        mockUserRepo.findOne.mockResolvedValue(null);

        const result = await createRepost({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(result).toBeUndefined();
    });

    it('should not re-add repost if already reposted', async () => {
        const post = {
            id: 'post-456',
            repostedBy: [{ id: 'user-123' }],
        };

        mockPostRepo.findOne
            .mockResolvedValueOnce(post)
            .mockResolvedValueOnce({ ...post, withFullRelations: true });
        mockUserRepo.findOne.mockResolvedValue({ id: 'user-123' });

        const result = await createRepost({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(mockCreateQueryBuilder.add).not.toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('should create repost successfully', async () => {
        const post = {
            id: 'post-456',
            repostedBy: [],
        };

        const updatedPost = {
            ...post,
            repostedBy: [{ id: 'user-123' }],
        };

        mockPostRepo.findOne
            .mockResolvedValueOnce(post)
            .mockResolvedValueOnce(updatedPost);
        mockUserRepo.findOne.mockResolvedValue({ id: 'user-123' });

        const result = await createRepost({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(mockCreateQueryBuilder.add).toHaveBeenCalledWith('user-123');
        expect(mockDriver.executeQuery).toHaveBeenCalledWith(
            expect.stringContaining('MERGE (u:User {id: $userId})'),
            { userId: 'user-123', postId: 'post-456' }
        );
        expect(result).toEqual(updatedPost);
    });

    it('should handle Neo4j sync failure gracefully', async () => {
        const post = {
            id: 'post-456',
            repostedBy: [],
        };

        mockPostRepo.findOne
            .mockResolvedValueOnce(post)
            .mockResolvedValueOnce({ ...post, repostedBy: [{ id: 'user-123' }] });
        mockUserRepo.findOne.mockResolvedValue({ id: 'user-123' });
        mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await createRepost({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(result).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to mirror repost relationship',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
