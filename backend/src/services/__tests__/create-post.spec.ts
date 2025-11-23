describe('createPost', () => {
    let createPost: any;
    let mockPostRepo: any;
    let mockUserRepo: any;
    let mockWorkoutRepo: any;
    let mockDriver: any;
    let mockExtractHashtags: any;
    let mockUpsertHashtags: any;
    let mockSyncHashtagsToNeo4j: any;
    let mockProcessMentions: any;

    beforeEach(() => {
        jest.resetModules();

        mockPostRepo = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
        };

        mockUserRepo = {
            findOne: jest.fn(),
        };

        mockWorkoutRepo = {
            find: jest.fn(),
        };

        mockDriver = {
            executeQuery: jest.fn().mockResolvedValue(undefined),
        };

        mockExtractHashtags = jest.fn().mockReturnValue([]);
        mockUpsertHashtags = jest.fn().mockResolvedValue([]);
        mockSyncHashtagsToNeo4j = jest.fn().mockResolvedValue(undefined);
        mockProcessMentions = jest.fn().mockResolvedValue(undefined);

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn((entity: any) => {
                    if (entity.name === 'Post') return mockPostRepo;
                    if (entity.name === 'User') return mockUserRepo;
                    if (entity.name === 'WorkoutActivity') return mockWorkoutRepo;
                    return mockPostRepo;
                }),
            },
        }));

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: mockDriver,
        }));

        jest.doMock('../hashtag-service', () => ({
            extractHashtags: mockExtractHashtags,
            upsertHashtags: mockUpsertHashtags,
            syncHashtagsToNeo4j: mockSyncHashtagsToNeo4j,
        }));

        jest.doMock('../mention-service', () => ({
            processMentions: mockProcessMentions,
        }));

        jest.doMock('typeorm', () => ({
            In: jest.fn((arr) => arr),
        }));

        const createPostModule = require('../create-post');
        createPost = createPostModule.createPost;
    });

    it('should create a simple post successfully', async () => {
        const author = { id: 'user-123', name: 'Test User' };
        const newPost = {
            id: 'post-456',
            content: 'Test post',
            author,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUserRepo.findOne.mockResolvedValue(author);
        mockPostRepo.create.mockReturnValue(newPost);
        mockPostRepo.save.mockResolvedValue(newPost);
        mockPostRepo.findOne.mockResolvedValue(newPost);

        const result = await createPost({
            authorId: 'user-123',
            content: 'Test post',
        });

        expect(result).toEqual(newPost);
        expect(mockPostRepo.create).toHaveBeenCalled();
        expect(mockPostRepo.save).toHaveBeenCalled();
        expect(mockDriver.executeQuery).toHaveBeenCalled();
    });

    it('should return undefined if author does not exist', async () => {
        mockUserRepo.findOne.mockResolvedValue(null);

        const result = await createPost({
            authorId: 'nonexistent',
            content: 'Test post',
        });

        expect(result).toBeUndefined();
        expect(mockPostRepo.create).not.toHaveBeenCalled();
    });

    it('should create a comment (post with parent)', async () => {
        const author = { id: 'user-123', name: 'Test User' };
        const parent = { id: 'post-111', content: 'Parent post' };
        const comment = {
            id: 'comment-789',
            content: 'Comment content',
            author,
            parent,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUserRepo.findOne.mockResolvedValue(author);
        mockPostRepo.findOne
            .mockResolvedValueOnce(parent)
            .mockResolvedValueOnce(comment);
        mockPostRepo.create.mockReturnValue(comment);
        mockPostRepo.save.mockResolvedValue(comment);

        const result = await createPost({
            authorId: 'user-123',
            content: 'Comment content',
            parentId: 'post-111',
        });

        expect(result).toBeDefined();
        expect(result?.parent).toEqual(parent);
        expect(mockDriver.executeQuery).toHaveBeenCalledTimes(2); // Post + Reply relation
    });

    it('should return undefined if parent does not exist', async () => {
        const author = { id: 'user-123', name: 'Test User' };

        mockUserRepo.findOne.mockResolvedValue(author);
        mockPostRepo.findOne.mockResolvedValue(null);

        const result = await createPost({
            authorId: 'user-123',
            content: 'Comment content',
            parentId: 'nonexistent',
        });

        expect(result).toBeUndefined();
    });

    it('should handle hashtags', async () => {
        const author = { id: 'user-123', name: 'Test User' };
        const hashtags = [
            { id: 'tag-1', tag: 'football', displayTag: 'Football' },
            { id: 'tag-2', tag: 'soccer', displayTag: 'Soccer' },
        ];
        const newPost = {
            id: 'post-456',
            content: 'Test post #football #soccer',
            author,
            hashtags,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUserRepo.findOne.mockResolvedValue(author);
        mockExtractHashtags.mockReturnValue(['football', 'soccer']);
        mockUpsertHashtags.mockResolvedValue(hashtags);
        mockPostRepo.create.mockReturnValue(newPost);
        mockPostRepo.save.mockResolvedValue(newPost);
        mockPostRepo.findOne.mockResolvedValue(newPost);

        const result = await createPost({
            authorId: 'user-123',
            content: 'Test post #football #soccer',
        });

        expect(mockExtractHashtags).toHaveBeenCalledWith('Test post #football #soccer');
        expect(mockUpsertHashtags).toHaveBeenCalledWith(['football', 'soccer'], expect.any(String));
        expect(result?.hashtags).toEqual(hashtags);
    });

    it('should handle workout activities', async () => {
        const author = { id: 'user-123', name: 'Test User' };
        const activities = [
            { id: 'activity-1', name: 'Morning Run', type: 'running' },
            { id: 'activity-2', name: 'Evening Ride', type: 'cycling' },
        ];
        const newPost = {
            id: 'post-456',
            content: 'Great workout today!',
            author,
            workoutActivities: activities,
            workoutActivity: activities[0],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUserRepo.findOne.mockResolvedValue(author);
        mockWorkoutRepo.find.mockResolvedValue(activities);
        mockPostRepo.create.mockReturnValue(newPost);
        mockPostRepo.save.mockResolvedValue(newPost);
        mockPostRepo.findOne.mockResolvedValue(newPost);

        const result = await createPost({
            authorId: 'user-123',
            content: 'Great workout today!',
            workoutActivityIds: ['activity-1', 'activity-2'],
        });

        expect(mockWorkoutRepo.find).toHaveBeenCalled();
        expect(result?.workoutActivities).toEqual(activities);
        expect(result?.workoutActivity).toEqual(activities[0]);
    });

    it('should handle Neo4j sync failure gracefully', async () => {
        const author = { id: 'user-123', name: 'Test User' };
        const newPost = {
            id: 'post-456',
            content: 'Test post',
            author,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUserRepo.findOne.mockResolvedValue(author);
        mockPostRepo.create.mockReturnValue(newPost);
        mockPostRepo.save.mockResolvedValue(newPost);
        mockPostRepo.findOne.mockResolvedValue(newPost);
        mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await createPost({
            authorId: 'user-123',
            content: 'Test post',
        });

        expect(result).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error syncing to Neo4j'),
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('should fetch post with all relations after creation', async () => {
        const author = { id: 'user-123', name: 'Test User' };
        const newPost = {
            id: 'post-456',
            content: 'Test post',
            author,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUserRepo.findOne.mockResolvedValue(author);
        mockPostRepo.create.mockReturnValue(newPost);
        mockPostRepo.save.mockResolvedValue(newPost);
        mockPostRepo.findOne.mockResolvedValue(newPost);

        await createPost({
            authorId: 'user-123',
            content: 'Test post',
        });

        expect(mockPostRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'post-456' },
            relations: expect.arrayContaining([
                'author',
                'parent',
                'comments',
                'likes',
                'likes.user',
                'workoutActivities',
                'hashtags',
            ]),
        });
    });
});
