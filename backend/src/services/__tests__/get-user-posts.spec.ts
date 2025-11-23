describe('getUserPosts', () => {
    let getUserPosts: any;
    let mockPostRepo: any;
    let IsNull: any;

    beforeEach(() => {
        jest.resetModules();

        mockPostRepo = {
            find: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockPostRepo),
            },
        }));

        jest.doMock('typeorm', () => ({
            IsNull: jest.fn(() => 'IS_NULL'),
        }));

        const getUserPostsModule = require('../get-user-posts');
        getUserPosts = getUserPostsModule.getUserPosts;

        const typeormModule = require('typeorm');
        IsNull = typeormModule.IsNull;
    });

    it('should return user posts with default relations', async () => {
        const posts = [
            {
                id: 'post-1',
                content: 'Post 1',
                author: { id: 'user-123' },
                createdAt: new Date('2024-01-02'),
            },
            {
                id: 'post-2',
                content: 'Post 2',
                author: { id: 'user-123' },
                createdAt: new Date('2024-01-01'),
            },
        ];

        mockPostRepo.find.mockResolvedValue(posts);

        const result = await getUserPosts({ userId: 'user-123' });

        expect(mockPostRepo.find).toHaveBeenCalledWith({
            where: {
                author: { id: 'user-123' },
                parent: 'IS_NULL',
            },
            relations: [
                'author',
                'parent',
                'comments',
                'comments.author',
                'comments.likes',
                'comments.likes.user',
                'likes',
                'likes.user',
                'repostedBy',
                'workoutActivity',
                'workoutActivities',
                'hashtags',
            ],
            order: { createdAt: 'DESC' },
        });
        expect(result).toEqual(posts);
    });

    it('should return user posts with custom relations', async () => {
        const posts = [
            {
                id: 'post-1',
                content: 'Post 1',
                author: { id: 'user-123' },
            },
        ];

        mockPostRepo.find.mockResolvedValue(posts);

        const result = await getUserPosts({
            userId: 'user-123',
            relations: ['author'],
        });

        expect(mockPostRepo.find).toHaveBeenCalledWith({
            where: {
                author: { id: 'user-123' },
                parent: 'IS_NULL',
            },
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
        expect(result).toEqual(posts);
    });

    it('should return empty array when user has no posts', async () => {
        mockPostRepo.find.mockResolvedValue([]);

        const result = await getUserPosts({ userId: 'user-123' });

        expect(result).toEqual([]);
    });

    it('should filter out comments by excluding posts with parents', async () => {
        mockPostRepo.find.mockResolvedValue([]);

        await getUserPosts({ userId: 'user-123' });

        expect(IsNull).toHaveBeenCalled();
        expect(mockPostRepo.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    parent: 'IS_NULL',
                }),
            })
        );
    });
});
