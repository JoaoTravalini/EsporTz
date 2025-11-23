describe('deleteFollower', () => {
    let deleteFollower: any;
    let mockUserRepo: any;
    let mockDriver: any;
    let mockCreateQueryBuilder: any;

    beforeEach(() => {
        jest.resetModules();

        mockCreateQueryBuilder = {
            relation: jest.fn().mockReturnThis(),
            of: jest.fn().mockReturnThis(),
            remove: jest.fn().mockResolvedValue(undefined),
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

        const deleteFollowerModule = require('../delete-follower');
        deleteFollower = deleteFollowerModule.deleteFollower;
    });

    it('should return false if followerId equals followedId', async () => {
        const result = await deleteFollower({
            followerId: 'user-123',
            followedId: 'user-123',
        });

        expect(result).toBe(false);
        expect(mockUserRepo.findOne).not.toHaveBeenCalled();
    });

    it('should return false if follower does not exist', async () => {
        mockUserRepo.findOne.mockResolvedValue(null);

        const result = await deleteFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(false);
    });

    it('should return true if not following', async () => {
        mockUserRepo.findOne.mockResolvedValue({
            id: 'user-123',
            following: [],
        });

        const result = await deleteFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(true);
        expect(mockCreateQueryBuilder.remove).not.toHaveBeenCalled();
    });

    it('should delete follower relationship successfully', async () => {
        mockUserRepo.findOne.mockResolvedValue({
            id: 'user-123',
            following: [{ id: 'user-456' }],
        });

        const result = await deleteFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(true);
        expect(mockCreateQueryBuilder.remove).toHaveBeenCalledWith('user-456');
        expect(mockDriver.executeQuery).toHaveBeenCalledWith(
            expect.stringContaining('MATCH (f:User {id: $followerId})-[r:FOLLOWS]'),
            { followerId: 'user-123', followedId: 'user-456' }
        );
    });

    it('should handle Neo4j sync failure gracefully', async () => {
        mockUserRepo.findOne.mockResolvedValue({
            id: 'user-123',
            following: [{ id: 'user-456' }],
        });

        mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await deleteFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Failed to remove follow graph relation'),
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
