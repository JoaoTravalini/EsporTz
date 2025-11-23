describe('getUser', () => {
    let getUser: any;
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

        const getUserModule = require('../get-user');
        getUser = getUserModule.getUser;
    });

    describe('get by id', () => {
        it('should return user when found by id', async () => {
            const user = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
            };

            mockUserRepo.findOne.mockResolvedValue(user);

            const result = await getUser({ id: 'user-123' });

            expect(mockUserRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                relations: [],
            });
            expect(result).toEqual(user);
        });

        it('should return undefined when user not found by id', async () => {
            mockUserRepo.findOne.mockResolvedValue(null);

            const result = await getUser({ id: 'user-123' });

            expect(result).toBeUndefined();
        });

        it('should include relations when provided', async () => {
            const user = {
                id: 'user-123',
                email: 'test@example.com',
                following: [],
            };

            mockUserRepo.findOne.mockResolvedValue(user);

            const result = await getUser({ id: 'user-123', relations: ['following'] });

            expect(mockUserRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                relations: ['following'],
            });
            expect(result).toEqual(user);
        });
    });

    describe('get by email', () => {
        it('should return user when found by email', async () => {
            const user = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
            };

            mockUserRepo.findOne.mockResolvedValue(user);

            const result = await getUser({ email: 'test@example.com' });

            expect(mockUserRepo.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                relations: [],
            });
            expect(result).toEqual(user);
        });

        it('should return undefined when user not found by email', async () => {
            mockUserRepo.findOne.mockResolvedValue(null);

            const result = await getUser({ email: 'test@example.com' });

            expect(result).toBeUndefined();
        });

        it('should include relations when provided', async () => {
            const user = {
                id: 'user-123',
                email: 'test@example.com',
                followers: [],
            };

            mockUserRepo.findOne.mockResolvedValue(user);

            const result = await getUser({ 
                email: 'test@example.com', 
                relations: ['followers'] 
            });

            expect(mockUserRepo.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                relations: ['followers'],
            });
            expect(result).toEqual(user);
        });
    });
});
