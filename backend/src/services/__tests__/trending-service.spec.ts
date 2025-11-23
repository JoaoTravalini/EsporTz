describe('Trending Service', () => {
    let getTrendingHashtags: any;
    let updateTrendingCache: any;
    let clearTrendingCache: any;
    let mockDriver: any;

    beforeEach(() => {
        jest.resetModules();

        mockDriver = {
            executeQuery: jest.fn(),
        };

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: mockDriver,
        }));

        jest.doMock('neo4j-driver', () => ({
            default: {
                int: (n: number) => n,
            },
            int: (n: number) => n,
        }));

        const trendingModule = require('../trending-service');
        getTrendingHashtags = trendingModule.getTrendingHashtags;
        updateTrendingCache = trendingModule.updateTrendingCache;
        clearTrendingCache = trendingModule.clearTrendingCache;

        // Clear cache before each test
        clearTrendingCache();
    });

    afterEach(() => {
        clearTrendingCache();
    });

    describe('getTrendingHashtags', () => {
        it('should return trending hashtags for 24h window', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            tag: 'football',
                            displayTag: 'Football',
                            postCount: { toNumber: () => 100 },
                            userCount: { toNumber: () => 50 },
                            growthRate: 75.5,
                            isTrending: true,
                        };
                        return data[key];
                    }),
                },
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            tag: 'soccer',
                            displayTag: 'Soccer',
                            postCount: { toNumber: () => 80 },
                            userCount: { toNumber: () => 40 },
                            growthRate: 60.0,
                            isTrending: true,
                        };
                        return data[key];
                    }),
                },
            ];

            mockDriver.executeQuery.mockResolvedValue({ records: mockRecords });

            const result = await getTrendingHashtags('24h', 10);

            expect(result).toHaveLength(2);
            expect(result[0].tag).toBe('football');
            expect(result[0].postCount).toBe(100);
            expect(result[0].isTrending).toBe(true);
        });

        it('should use cache when available and valid', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            tag: 'football',
                            displayTag: 'Football',
                            postCount: { toNumber: () => 100 },
                            userCount: { toNumber: () => 50 },
                            growthRate: 75.5,
                            isTrending: true,
                        };
                        return data[key];
                    }),
                },
            ];

            mockDriver.executeQuery.mockResolvedValue({ records: mockRecords });

            // First call - should query Neo4j
            await getTrendingHashtags('24h', 10);

            // Second call - should use cache
            const result = await getTrendingHashtags('24h', 10);

            expect(mockDriver.executeQuery).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
        });

        it('should support different time windows', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            tag: 'trending',
                            displayTag: 'Trending',
                            postCount: { toNumber: () => 50 },
                            userCount: { toNumber: () => 25 },
                            growthRate: 100.0,
                            isTrending: true,
                        };
                        return data[key];
                    }),
                },
            ];

            mockDriver.executeQuery.mockResolvedValue({ records: mockRecords });

            const result1h = await getTrendingHashtags('1h', 5);
            const result7d = await getTrendingHashtags('7d', 5);
            const result30d = await getTrendingHashtags('30d', 5);

            expect(result1h).toBeDefined();
            expect(result7d).toBeDefined();
            expect(result30d).toBeDefined();
        });

        it('should return empty array on error with no cache', async () => {
            mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await getTrendingHashtags('24h', 10);

            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should return stale cache on error when cache exists', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            tag: 'cached',
                            displayTag: 'Cached',
                            postCount: { toNumber: () => 10 },
                            userCount: { toNumber: () => 5 },
                            growthRate: 50.0,
                            isTrending: true,
                        };
                        return data[key];
                    }),
                },
            ];

            // First call succeeds and populates cache
            mockDriver.executeQuery.mockResolvedValueOnce({ records: mockRecords });
            await getTrendingHashtags('24h', 10);

            // Second call fails
            mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            // Should return cached result
            const result = await getTrendingHashtags('24h', 10);

            expect(result).toHaveLength(1);
            expect(result[0].tag).toBe('cached');

            consoleSpy.mockRestore();
            consoleLogSpy.mockRestore();
        });
    });

    describe('updateTrendingCache', () => {
        it('should update cache for all time windows', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            tag: 'test',
                            displayTag: 'Test',
                            postCount: { toNumber: () => 10 },
                            userCount: { toNumber: () => 5 },
                            growthRate: 50.0,
                            isTrending: true,
                        };
                        return data[key];
                    }),
                },
            ];

            mockDriver.executeQuery.mockResolvedValue({ records: mockRecords });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await updateTrendingCache();

            // Should update for 4 time windows * 2 limits = 8 calls
            expect(mockDriver.executeQuery).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Trending cache update completed')
            );

            consoleSpy.mockRestore();
        });

        it('should handle errors during cache update', async () => {
            mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(updateTrendingCache()).rejects.toThrow();

            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('clearTrendingCache', () => {
        it('should clear the cache', async () => {
            const mockRecords = [
                {
                    get: jest.fn((key) => {
                        const data: any = {
                            tag: 'test',
                            displayTag: 'Test',
                            postCount: { toNumber: () => 10 },
                            userCount: { toNumber: () => 5 },
                            growthRate: 50.0,
                            isTrending: true,
                        };
                        return data[key];
                    }),
                },
            ];

            mockDriver.executeQuery.mockResolvedValue({ records: mockRecords });

            // Populate cache
            await getTrendingHashtags('24h', 10);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            clearTrendingCache();

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Trending cache cleared')
            );

            consoleSpy.mockRestore();

            // Next call should hit Neo4j again
            await getTrendingHashtags('24h', 10);

            expect(mockDriver.executeQuery).toHaveBeenCalledTimes(2);
        });
    });
});
