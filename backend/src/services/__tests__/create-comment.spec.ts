describe('createComment', () => {
    let createComment: any;
    let createPost: any;

    beforeEach(() => {
        jest.resetModules();

        jest.doMock('../create-post', () => ({
            createPost: jest.fn(),
        }));

        const createCommentModule = require('../create-comment');
        createComment = createCommentModule.createComment;

        const createPostModule = require('../create-post');
        createPost = createPostModule.createPost;
    });

    it('should create a comment by calling createPost with correct params', async () => {
        const params = {
            authorId: 'user-123',
            parentPostId: 'post-456',
            content: 'Great post!',
        };

        const expectedPost = {
            id: 'comment-789',
            authorId: params.authorId,
            content: params.content,
            parentId: params.parentPostId,
        };

        createPost.mockResolvedValue(expectedPost);

        const result = await createComment(params);

        expect(createPost).toHaveBeenCalledWith({
            authorId: params.authorId,
            content: params.content,
            parentId: params.parentPostId,
        });
        expect(result).toEqual(expectedPost);
    });

    it('should return undefined if createPost returns undefined', async () => {
        const params = {
            authorId: 'user-123',
            parentPostId: 'post-456',
            content: 'Comment content',
        };

        createPost.mockResolvedValue(undefined);

        const result = await createComment(params);

        expect(result).toBeUndefined();
    });
});
