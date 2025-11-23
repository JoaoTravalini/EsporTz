describe('getPosts', () => {
    let getPosts: any;
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

        const getPostsModule = require('../get-posts');
        getPosts = getPostsModule.getPosts;

        const typeormModule = require('typeorm');
        IsNull = typeormModule.IsNull;
    });

    it('should return all posts ordered by createdAt DESC', async () => {
        const posts = [
            {
                id: 'post-1',
                content: 'Post 1',
                createdAt: new Date('2024-01-02'),
                parent: null,
            },
            {
                id: 'post-2',
                content: 'Post 2',
                createdAt: new Date('2024-01-01'),
                parent: null,
            },
        ];

        mockPostRepo.find.mockResolvedValue(posts);

        const result = await getPosts();

        expect(mockPostRepo.find).toHaveBeenCalledWith({
            where: { parent: 'IS_NULL' },
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
                'workoutActivities',
                'hashtags',
            ],
            order: { createdAt: 'DESC' },
        });
        expect(result).toEqual(posts);
    });

    it('should return empty array when no posts found', async () => {
        mockPostRepo.find.mockResolvedValue([]);

        const result = await getPosts();

        expect(result).toEqual([]);
    });

    it('should filter out comments by excluding posts with parents', async () => {
        mockPostRepo.find.mockResolvedValue([
            { id: 'post-1', parent: null },
            { id: 'post-2', parent: null },
        ]);

        await getPosts();

        expect(IsNull).toHaveBeenCalled();
        expect(mockPostRepo.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { parent: 'IS_NULL' },
            })
        );
    });
});
