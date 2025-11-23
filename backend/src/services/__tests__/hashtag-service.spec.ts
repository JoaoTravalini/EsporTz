describe('Hashtag Service', () => {
    let extractHashtags: any;
    let isValidHashtag: any;
    let upsertHashtags: any;
    let searchHashtags: any;
    let mockHashtagRepo: any;

    beforeEach(() => {
        jest.resetModules();

        mockHashtagRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockHashtagRepo),
            },
        }));

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: {
                executeQuery: jest.fn().mockResolvedValue(undefined),
            },
        }));

        jest.doMock('typeorm', () => ({
            In: jest.fn((arr) => arr),
        }));

        const hashtagServiceModule = require('../hashtag-service');
        extractHashtags = hashtagServiceModule.extractHashtags;
        isValidHashtag = hashtagServiceModule.isValidHashtag;
        upsertHashtags = hashtagServiceModule.upsertHashtags;
        searchHashtags = hashtagServiceModule.searchHashtags;
    });

    describe('extractHashtags', () => {
        it('should extract hashtags from content', () => {
            const content = 'Check out #football and #soccer today! #UEFA';
            const result = extractHashtags(content);

            expect(result).toEqual(['football', 'soccer', 'uefa']);
        });

        it('should return empty array for content without hashtags', () => {
            const content = 'This is a post without hashtags';
            const result = extractHashtags(content);

            expect(result).toEqual([]);
        });

        it('should remove duplicate hashtags', () => {
            const content = '#football is great! I love #football and #FOOTBALL';
            const result = extractHashtags(content);

            expect(result).toEqual(['football']);
        });

        it('should ignore hashtags longer than 50 characters', () => {
            const content = '#short #' + 'a'.repeat(51);
            const result = extractHashtags(content);

            expect(result).toEqual(['short']);
        });

        it('should handle empty content', () => {
            const result = extractHashtags('');
            expect(result).toEqual([]);
        });

        it('should normalize hashtags to lowercase', () => {
            const content = '#Football #SOCCER #BasketBall';
            const result = extractHashtags(content);

            expect(result).toEqual(['football', 'soccer', 'basketball']);
        });
    });

    describe('isValidHashtag', () => {
        it('should validate correct hashtag', () => {
            expect(isValidHashtag('football')).toBe(true);
            expect(isValidHashtag('foot_ball')).toBe(true);
            expect(isValidHashtag('football123')).toBe(true);
        });

        it('should reject empty hashtag', () => {
            expect(isValidHashtag('')).toBe(false);
        });

        it('should reject hashtag longer than 50 characters', () => {
            expect(isValidHashtag('a'.repeat(51))).toBe(false);
        });

        it('should reject hashtag with special characters', () => {
            expect(isValidHashtag('foot-ball')).toBe(false);
            expect(isValidHashtag('foot ball')).toBe(false);
            expect(isValidHashtag('foot@ball')).toBe(false);
        });
    });

    describe('upsertHashtags', () => {
        it('should create new hashtags', async () => {
            const tags = ['football', 'soccer'];
            const content = 'Love #Football and #Soccer';

            mockHashtagRepo.findOne.mockResolvedValue(null);
            mockHashtagRepo.create.mockImplementation((data:any) => data);
            mockHashtagRepo.save.mockImplementation((data:any) => 
                Promise.resolve({ ...data, id: 'hashtag-123' })
            );

            const result = await upsertHashtags(tags, content);

            expect(result).toHaveLength(2);
            expect(mockHashtagRepo.create).toHaveBeenCalledTimes(2);
            expect(mockHashtagRepo.save).toHaveBeenCalledTimes(2);
        });

        it('should update existing hashtags', async () => {
            const tags = ['football'];
            const content = '#football';

            const existingHashtag = {
                id: 'hashtag-123',
                tag: 'football',
                postCount: 5,
                lastUsedAt: new Date('2024-01-01'),
            };

            mockHashtagRepo.findOne.mockResolvedValue(existingHashtag);
            mockHashtagRepo.save.mockResolvedValue({
                ...existingHashtag,
                postCount: 6,
            });

            const result = await upsertHashtags(tags, content);

            expect(result).toHaveLength(1);
            expect(mockHashtagRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    postCount: 6,
                })
            );
        });

        it('should skip invalid hashtags', async () => {
            const tags = ['football', 'invalid@tag', 'soccer'];
            const content = '#football #soccer';

            mockHashtagRepo.findOne.mockResolvedValue(null);
            mockHashtagRepo.create.mockImplementation((data:any) => data);
            mockHashtagRepo.save.mockImplementation((data:any) => 
                Promise.resolve({ ...data, id: 'hashtag-123' })
            );

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = await upsertHashtags(tags, content);

            expect(result).toHaveLength(2);
            expect(consoleSpy).toHaveBeenCalledWith('Invalid hashtag skipped: invalid@tag');

            consoleSpy.mockRestore();
        });

        it('should return empty array for empty tags', async () => {
            const result = await upsertHashtags([], 'content');
            expect(result).toEqual([]);
        });
    });

    describe('searchHashtags', () => {
        it('should search hashtags by query', async () => {
            const hashtags = [
                { id: '1', tag: 'football', postCount: 100 },
                { id: '2', tag: 'football_news', postCount: 50 },
            ];

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(hashtags),
            };

            mockHashtagRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await searchHashtags('foot');

            expect(result).toEqual(hashtags);
            expect(mockQueryBuilder.where).toHaveBeenCalled();
        });

        it('should return popular hashtags when query is empty', async () => {
            const hashtags = [
                { id: '1', tag: 'trending', postCount: 1000 },
                { id: '2', tag: 'popular', postCount: 900 },
            ];

            mockHashtagRepo.find.mockResolvedValue(hashtags);

            const result = await searchHashtags('');

            expect(result).toEqual(hashtags);
            expect(mockHashtagRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: { postCount: 'DESC' },
                })
            );
        });

        it('should handle # prefix in query', async () => {
            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            };

            mockHashtagRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await searchHashtags('#foot');

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                expect.any(String),
                { query: '%foot%' }
            );
        });
    });
});
