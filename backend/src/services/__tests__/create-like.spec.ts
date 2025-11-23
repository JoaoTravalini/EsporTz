describe('createLike', () => {
    let createLike: any;
    let mockLikeRepo: any;
    let mockPostRepo: any;
    let mockUserRepo: any;
    let mockDriver: any;

    beforeEach(() => {
        jest.resetModules();

        mockLikeRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        mockPostRepo = {
            findOne: jest.fn(),
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
                    if (entity.name === 'Like') return mockLikeRepo;
                    if (entity.name === 'Post') return mockPostRepo;
                    if (entity.name === 'User') return mockUserRepo;
                    return mockLikeRepo;
                }),
            },
        }));

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: mockDriver,
        }));

        const createLikeModule = require('../create-like');
        createLike = createLikeModule.createLike;
    });

    it('should return undefined if user does not exist', async () => {
        mockUserRepo.findOne.mockResolvedValue(null);
        mockPostRepo.findOne.mockResolvedValue({ id: 'post-123' });

        const result = await createLike({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(result).toBeUndefined();
    });

    it('should return undefined if post does not exist', async () => {
        mockUserRepo.findOne.mockResolvedValue({ id: 'user-123' });
        mockPostRepo.findOne.mockResolvedValue(null);

        const result = await createLike({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(result).toBeUndefined();
    });

    it('should return existing like if already liked', async () => {
        const existingLike = {
            id: 'like-789',
            user: { id: 'user-123' },
            post: { id: 'post-456' },
        };

        mockUserRepo.findOne.mockResolvedValue({ id: 'user-123' });
        mockPostRepo.findOne.mockResolvedValue({ id: 'post-456' });
        mockLikeRepo.findOne.mockResolvedValue(existingLike);

        const result = await createLike({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(result).toEqual(existingLike);
        expect(mockLikeRepo.create).not.toHaveBeenCalled();
    });

    it('should create a new like successfully', async () => {
        const user = { id: 'user-123' };
        const post = { id: 'post-456' };
        const newLike = { id: 'like-789', user, post };

        mockUserRepo.findOne.mockResolvedValue(user);
        mockPostRepo.findOne.mockResolvedValue(post);
        mockLikeRepo.findOne
            .mockResolvedValueOnce(null) // First check for existing like
            .mockResolvedValueOnce(newLike); // Fetch with relations after save
        mockLikeRepo.create.mockReturnValue(newLike);
        mockLikeRepo.save.mockResolvedValue(newLike);

        const result = await createLike({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(mockLikeRepo.create).toHaveBeenCalledWith({ user, post });
        expect(mockLikeRepo.save).toHaveBeenCalledWith(newLike);
        expect(mockDriver.executeQuery).toHaveBeenCalledWith(
            expect.stringContaining('MERGE (u:User {id: $userId})'),
            { userId: 'user-123', postId: 'post-456' }
        );
        expect(result).toEqual(newLike);
    });

    it('should handle Neo4j sync failure gracefully', async () => {
        const user = { id: 'user-123' };
        const post = { id: 'post-456' };
        const newLike = { id: 'like-789', user, post };

        mockUserRepo.findOne.mockResolvedValue(user);
        mockPostRepo.findOne.mockResolvedValue(post);
        mockLikeRepo.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(newLike);
        mockLikeRepo.create.mockReturnValue(newLike);
        mockLikeRepo.save.mockResolvedValue(newLike);
        mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await createLike({
            userId: 'user-123',
            postId: 'post-456',
        });

        expect(result).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to mirror like in Neo4j',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
