describe('getLike', () => {
    let getLike: any;
    let mockLikeRepo: any;

    beforeEach(() => {
        jest.resetModules();

        mockLikeRepo = {
            findOne: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockLikeRepo),
            },
        }));

        const getLikeModule = require('../get-like');
        getLike = getLikeModule.getLike;
    });

    describe('getLike by ID', () => {
        it('should return like when found by id', async () => {
            const like = {
                id: 'like-123',
                user: { id: 'user-456' },
                post: { id: 'post-789' },
            };

            mockLikeRepo.findOne.mockResolvedValue(like);

            const result = await getLike({ id: 'like-123' });

            expect(mockLikeRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'like-123' },
                relations: ['user', 'post'],
            });
            expect(result).toEqual(like);
        });

        it('should return undefined when not found by id', async () => {
            mockLikeRepo.findOne.mockResolvedValue(null);

            const result = await getLike({ id: 'like-123' });

            expect(result).toBeUndefined();
        });

        it('should use custom relations when provided', async () => {
            const like = {
                id: 'like-123',
                user: { id: 'user-456' },
            };

            mockLikeRepo.findOne.mockResolvedValue(like);

            const result = await getLike({ id: 'like-123', relations: ['user'] });

            expect(mockLikeRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'like-123' },
                relations: ['user'],
            });
            expect(result).toEqual(like);
        });
    });

    describe('getLike by userId and postId', () => {
        it('should return like when found by userId and postId', async () => {
            const like = {
                id: 'like-123',
                user: { id: 'user-456' },
                post: { id: 'post-789' },
            };

            mockLikeRepo.findOne.mockResolvedValue(like);

            const result = await getLike({
                userId: 'user-456',
                postId: 'post-789',
            });

            expect(mockLikeRepo.findOne).toHaveBeenCalledWith({
                where: {
                    user: { id: 'user-456' },
                    post: { id: 'post-789' },
                },
                relations: ['user', 'post'],
            });
            expect(result).toEqual(like);
        });

        it('should return undefined when not found by userId and postId', async () => {
            mockLikeRepo.findOne.mockResolvedValue(null);

            const result = await getLike({
                userId: 'user-456',
                postId: 'post-789',
            });

            expect(result).toBeUndefined();
        });

        it('should use custom relations when provided', async () => {
            const like = {
                id: 'like-123',
                post: { id: 'post-789' },
            };

            mockLikeRepo.findOne.mockResolvedValue(like);

            const result = await getLike({
                userId: 'user-456',
                postId: 'post-789',
                relations: ['post'],
            });

            expect(mockLikeRepo.findOne).toHaveBeenCalledWith({
                where: {
                    user: { id: 'user-456' },
                    post: { id: 'post-789' },
                },
                relations: ['post'],
            });
            expect(result).toEqual(like);
        });
    });
});
