describe('getPost', () => {
    let getPost: any;
    let mockPostRepo: any;

    beforeEach(() => {
        jest.resetModules();

        mockPostRepo = {
            findOne: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockPostRepo),
            },
        }));

        const getPostModule = require('../get-post');
        getPost = getPostModule.getPost;
    });

    it('should return post with default relations', async () => {
        const post = {
            id: 'post-123',
            content: 'Test post',
            author: { id: 'user-456' },
            comments: [],
            likes: [],
        };

        mockPostRepo.findOne.mockResolvedValue(post);

        const result = await getPost({ id: 'post-123' });

        expect(mockPostRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'post-123' },
            relations: [
                'author',
                'parent',
                'comments',
                'comments.author',
                'likes',
                'likes.user',
                'repostedBy',
                'workoutActivity',
                'workoutActivities',
                'hashtags',
            ],
        });
        expect(result).toEqual(post);
    });

    it('should return post with custom relations', async () => {
        const post = {
            id: 'post-123',
            content: 'Test post',
            author: { id: 'user-456' },
        };

        mockPostRepo.findOne.mockResolvedValue(post);

        const result = await getPost({
            id: 'post-123',
            relations: ['author'],
        });

        expect(mockPostRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'post-123' },
            relations: ['author'],
        });
        expect(result).toEqual(post);
    });

    it('should return undefined when post not found', async () => {
        mockPostRepo.findOne.mockResolvedValue(null);

        const result = await getPost({ id: 'post-123' });

        expect(result).toBeUndefined();
    });
});
