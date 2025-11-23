describe('createFollower', () => {
    let createFollower: any;
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

        mockUserRepo = {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => mockCreateQueryBuilder),
        };

        mockDriver = {
            executeQuery: jest.fn().mockResolvedValue(undefined),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockUserRepo),
            },
        }));

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: mockDriver,
        }));

        const createFollowerModule = require('../create-follower');
        createFollower = createFollowerModule.createFollower;
    });

    it('should return false if followerId equals followedId', async () => {
        const result = await createFollower({
            followerId: 'user-123',
            followedId: 'user-123',
        });

        expect(result).toBe(false);
        expect(mockUserRepo.findOne).not.toHaveBeenCalled();
    });

    it('should return false if follower does not exist', async () => {
        mockUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'user-456' });

        const result = await createFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(false);
    });

    it('should return false if followed user does not exist', async () => {
        mockUserRepo.findOne.mockResolvedValueOnce({ id: 'user-123', following: [] }).mockResolvedValueOnce(null);

        const result = await createFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(false);
    });

    it('should return true if already following', async () => {
        mockUserRepo.findOne
            .mockResolvedValueOnce({
                id: 'user-123',
                following: [{ id: 'user-456' }],
            })
            .mockResolvedValueOnce({ id: 'user-456' });

        const result = await createFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(true);
        expect(mockCreateQueryBuilder.add).not.toHaveBeenCalled();
    });

    it('should create follower relationship successfully', async () => {
        mockUserRepo.findOne
            .mockResolvedValueOnce({
                id: 'user-123',
                following: [],
            })
            .mockResolvedValueOnce({ id: 'user-456' });

        const result = await createFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(true);
        expect(mockCreateQueryBuilder.add).toHaveBeenCalledWith('user-456');
        expect(mockDriver.executeQuery).toHaveBeenCalledWith(
            expect.stringContaining('MERGE (f:User {id: $followerId})'),
            { followerId: 'user-123', followedId: 'user-456' }
        );
    });

    it('should handle Neo4j sync failure gracefully', async () => {
        mockUserRepo.findOne
            .mockResolvedValueOnce({
                id: 'user-123',
                following: [],
            })
            .mockResolvedValueOnce({ id: 'user-456' });

        mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await createFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Failed to mirror follow graph relation'),
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
