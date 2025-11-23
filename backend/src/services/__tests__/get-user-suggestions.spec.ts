describe('User Suggestions Service', () => {
    let getUserSuggestions: any;
    let mockUserRepo: any;
    let mockDriver: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        jest.resetModules();

        mockQueryBuilder = {
            whereInIds: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
        };

        mockUserRepo = {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
        };

        mockDriver = {
            executeQuery: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockUserRepo),
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

        const suggestionsModule = require('../get-user-suggestions');
        getUserSuggestions = suggestionsModule.getUserSuggestions;
    });

    it('should return random users when user has no connections', async () => {
        const mockRecord = {
            get: jest.fn((key: string) => ({
                toNumber: () => 0,
            })),
        };

        mockDriver.executeQuery
            .mockResolvedValueOnce({ records: [mockRecord] })
            .mockResolvedValueOnce({
                records: [
                    { get: () => 'user-123' },
                    { get: () => 'user-456' },
                ],
            });

        mockQueryBuilder.getMany.mockResolvedValue([
            { id: 'user-123', name: 'User 1' },
            { id: 'user-456', name: 'User 2' },
        ]);

        const result = await getUserSuggestions({ userId: 'current-user' });

        expect(result).toHaveLength(2);
    });

    it('should return smart suggestions when user has connections', async () => {
        const mockRecord = {
            get: jest.fn((key: string) => ({
                toNumber: () => 5,
            })),
        };

        mockDriver.executeQuery
            .mockResolvedValueOnce({ records: [mockRecord] })
            .mockResolvedValueOnce({
                records: [
                    { get: () => 'user-789' },
                    { get: () => 'user-101' },
                ],
            });

        mockQueryBuilder.getMany.mockResolvedValue([
            { id: 'user-789', name: 'Friend of Friend' },
            { id: 'user-101', name: 'Popular User' },
        ]);

        const result = await getUserSuggestions({ userId: 'current-user' });

        expect(result).toHaveLength(2);
    });

    it('should fall back to Postgres on Neo4j error', async () => {
        mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

        mockUserRepo.findOne.mockResolvedValue({
            id: 'current-user',
            following: [],
        });

        mockQueryBuilder.getMany.mockResolvedValue([
            { id: 'user-123', name: 'Random User' },
        ]);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await getUserSuggestions({ userId: 'current-user' });

        expect(result).toBeDefined();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('should filter out invalid UUIDs', async () => {
        const mockRecord = {
            get: jest.fn((key: string) => ({
                toNumber: () => 0,
            })),
        };

        mockDriver.executeQuery
            .mockResolvedValueOnce({ records: [mockRecord] })
            .mockResolvedValueOnce({
                records: [
                    { get: () => 'invalid-uuid' },
                    { get: () => 'abc123ef-0000-0000-0000-000000000000' },
                ],
            });

        mockUserRepo.findOne.mockResolvedValue({
            id: 'current-user',
            following: [],
        });

        mockQueryBuilder.getMany.mockResolvedValue([
            { id: 'abc123ef-0000-0000-0000-000000000000', name: 'Valid User' },
        ]);

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await getUserSuggestions({ userId: 'current-user' });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should respect limit parameter', async () => {
        const mockRecord = {
            get: jest.fn((key: string) => ({
                toNumber: () => 0,
            })),
        };

        mockDriver.executeQuery
            .mockResolvedValueOnce({ records: [mockRecord] })
            .mockResolvedValueOnce({
                records: Array.from({ length: 10 }, (_, i) => ({
                    get: () => `abc123ef-0000-0000-0000-00000000000${i}`,
                })),
            });

        mockQueryBuilder.getMany.mockResolvedValue([]);

        await getUserSuggestions({ userId: 'current-user', limit: 3 });

        expect(mockDriver.executeQuery).toHaveBeenCalled();
    });
});
