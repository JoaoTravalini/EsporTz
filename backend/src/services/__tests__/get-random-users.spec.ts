describe('getRandomUsers', () => {
    let getRandomUsers: any;
    let mockUserRepo: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        jest.resetModules();

        mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
        };

        mockUserRepo = {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockUserRepo),
            },
        }));

        const getRandomUsersModule = require('../get-random-users');
        getRandomUsers = getRandomUsersModule.getRandomUsers;
    });

    it('should return random users with default limit', async () => {
        const users = [
            { id: 'user-1', name: 'User 1' },
            { id: 'user-2', name: 'User 2' },
            { id: 'user-3', name: 'User 3' },
            { id: 'user-4', name: 'User 4' },
            { id: 'user-5', name: 'User 5' },
        ];

        mockQueryBuilder.getMany.mockResolvedValue(users);

        const result = await getRandomUsers();

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('RANDOM()');
        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
        expect(result).toEqual(users);
    });

    it('should return random users with custom limit', async () => {
        const users = [
            { id: 'user-1', name: 'User 1' },
            { id: 'user-2', name: 'User 2' },
            { id: 'user-3', name: 'User 3' },
        ];

        mockQueryBuilder.getMany.mockResolvedValue(users);

        const result = await getRandomUsers({ limit: 3 });

        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(3);
        expect(result).toEqual(users);
    });

    it('should exclude specific user when excludeUserId provided', async () => {
        const users = [
            { id: 'user-2', name: 'User 2' },
            { id: 'user-3', name: 'User 3' },
        ];

        mockQueryBuilder.getMany.mockResolvedValue(users);

        const result = await getRandomUsers({ excludeUserId: 'user-1' });

        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
            'user.id != :excludeUserId',
            { excludeUserId: 'user-1' }
        );
        expect(result).toEqual(users);
    });

    it('should return empty array when no users found', async () => {
        mockQueryBuilder.getMany.mockResolvedValue([]);

        const result = await getRandomUsers();

        expect(result).toEqual([]);
    });

    it('should handle both limit and excludeUserId together', async () => {
        const users = [
            { id: 'user-2', name: 'User 2' },
            { id: 'user-3', name: 'User 3' },
        ];

        mockQueryBuilder.getMany.mockResolvedValue(users);

        const result = await getRandomUsers({ 
            limit: 2, 
            excludeUserId: 'user-1' 
        });

        expect(mockQueryBuilder.where).toHaveBeenCalled();
        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(2);
        expect(result).toEqual(users);
    });
});
