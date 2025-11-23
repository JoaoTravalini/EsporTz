describe('getComment', () => {
    let getComment: any;
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

        const getCommentModule = require('../get-comment');
        getComment = getCommentModule.getComment;
    });

    it('should return comment with default relations', async () => {
        const comment = {
            id: 'comment-123',
            content: 'Great post!',
            parent: { id: 'post-456' },
            author: { id: 'user-789' },
        };

        mockPostRepo.findOne.mockResolvedValue(comment);

        const result = await getComment({ id: 'comment-123' });

        expect(mockPostRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'comment-123' },
            relations: ['author', 'parent', 'likes', 'likes.user'],
        });
        expect(result).toEqual(comment);
    });

    it('should return comment with custom relations', async () => {
        const comment = {
            id: 'comment-123',
            content: 'Great post!',
            parent: { id: 'post-456' },
        };

        mockPostRepo.findOne.mockResolvedValue(comment);

        const result = await getComment({
            id: 'comment-123',
            relations: ['parent'],
        });

        expect(mockPostRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'comment-123' },
            relations: ['parent'],
        });
        expect(result).toEqual(comment);
    });

    it('should return undefined if comment not found', async () => {
        mockPostRepo.findOne.mockResolvedValue(null);

        const result = await getComment({ id: 'comment-123' });

        expect(result).toBeUndefined();
    });

    it('should return undefined if post has no parent (not a comment)', async () => {
        const post = {
            id: 'post-123',
            content: 'This is a post, not a comment',
            parent: null,
        };

        mockPostRepo.findOne.mockResolvedValue(post);

        const result = await getComment({ id: 'post-123' });

        expect(result).toBeUndefined();
    });
});
