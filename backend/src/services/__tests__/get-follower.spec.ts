describe('getFollower', () => {
    let getFollower: any;
    let mockUserRepo: any;

    beforeEach(() => {
        jest.resetModules();

        mockUserRepo = {
            findOne: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockUserRepo),
            },
        }));

        const getFollowerModule = require('../get-follower');
        getFollower = getFollowerModule.getFollower;
    });

    it('should return undefined if follower does not exist', async () => {
        mockUserRepo.findOne.mockResolvedValue(null);

        const result = await getFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBeUndefined();
    });

    it('should return undefined if not following', async () => {
        mockUserRepo.findOne.mockResolvedValue({
            id: 'user-123',
            following: [{ id: 'user-789' }],
        });

        const result = await getFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBeUndefined();
    });

    it('should return followed user if following', async () => {
        const followedUser = { id: 'user-456', name: 'John Doe' };

        mockUserRepo.findOne.mockResolvedValue({
            id: 'user-123',
            following: [followedUser, { id: 'user-789' }],
        });

        const result = await getFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toEqual(followedUser);
    });

    it('should handle empty following array', async () => {
        mockUserRepo.findOne.mockResolvedValue({
            id: 'user-123',
            following: [],
        });

        const result = await getFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBeUndefined();
    });

    it('should handle undefined following array', async () => {
        mockUserRepo.findOne.mockResolvedValue({
            id: 'user-123',
            following: undefined,
        });

        const result = await getFollower({
            followerId: 'user-123',
            followedId: 'user-456',
        });

        expect(result).toBeUndefined();
    });
});
