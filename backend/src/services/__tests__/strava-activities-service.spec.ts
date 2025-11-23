describe('Strava Activities Service', () => {
    let getAthleteStravaActivities: any;
    let syncAthleteActivities: any;
    let getUserActivities: any;
    let getActivityById: any;
    let mockWorkoutRepo: any;
    let mockRefreshTokenRepo: any;
    let mockRefreshStravaAccessToken: any;

    beforeEach(() => {
        jest.resetModules();

        mockWorkoutRepo = {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
        };

        mockRefreshTokenRepo = {
            findOne: jest.fn(),
        };

        mockRefreshStravaAccessToken = jest.fn();

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn((entity: any) => {
                    if (entity.name === 'WorkoutActivity') return mockWorkoutRepo;
                    if (entity.name === 'RefreshToken') return mockRefreshTokenRepo;
                    return mockWorkoutRepo;
                }),
            },
        }));

        jest.doMock('../strava-token-service', () => ({
            refreshStravaAccessToken: mockRefreshStravaAccessToken,
        }));

        global.fetch = jest.fn();

        const stravaActivitiesModule = require('../strava-activities-service');
        getAthleteStravaActivities = stravaActivitiesModule.getAthleteStravaActivities;
        syncAthleteActivities = stravaActivitiesModule.syncAthleteActivities;
        getUserActivities = stravaActivitiesModule.getUserActivities;
        getActivityById = stravaActivitiesModule.getActivityById;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getAthleteStravaActivities', () => {
        it('should fetch strava activities successfully', async () => {
            const mockToken = {
                accessToken: 'test-token',
            };

            const mockActivities = [
                {
                    id: 123,
                    name: 'Morning Run',
                    type: 'Run',
                    distance: 5000,
                    moving_time: 1800,
                    start_date: '2024-01-01T10:00:00Z',
                },
            ];

            mockRefreshStravaAccessToken.mockResolvedValue({ token: mockToken });
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockActivities),
            });

            const result = await getAthleteStravaActivities('athlete-123');

            expect(result.activities).toHaveLength(1);
            expect(result.activities[0].name).toBe('Morning Run');
        });

        it('should handle fetch error', async () => {
            const mockToken = {
                accessToken: 'test-token',
            };

            mockRefreshStravaAccessToken.mockResolvedValue({ token: mockToken });
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 401,
                json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
            });

            await expect(getAthleteStravaActivities('athlete-123')).rejects.toThrow();
        });

        it('should throw error when token not found', async () => {
            mockRefreshStravaAccessToken.mockResolvedValue(undefined);

            await expect(getAthleteStravaActivities('athlete-123')).rejects.toThrow(
                'No token found for athlete'
            );
        });
    });

    describe('syncAthleteActivities', () => {
        it('should sync activities to database', async () => {
            const mockToken = {
                accessToken: 'test-token',
            };

            const mockActivities = [
                {
                    id: 123,
                    name: 'Morning Run',
                    type: 'Run',
                    distance: 5000,
                    moving_time: 1800,
                    start_date: '2024-01-01T10:00:00Z',
                },
            ];

            mockRefreshStravaAccessToken.mockResolvedValue({ token: mockToken });
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockActivities),
            });

            mockWorkoutRepo.save.mockResolvedValue([
                {
                    id: 'workout-123',
                    name: 'Morning Run',
                    type: 'running',
                },
            ]);

            const result = await syncAthleteActivities('athlete-123', 'user-123');

            expect(mockWorkoutRepo.save).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });

        it('should handle sync errors gracefully', async () => {
            mockRefreshStravaAccessToken.mockRejectedValue(new Error('Token error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(syncAthleteActivities('athlete-123')).rejects.toThrow();

            consoleSpy.mockRestore();
        });
    });

    describe('getUserActivities', () => {
        it('should get user activities', async () => {
            const activities = [
                {
                    id: 'activity-1',
                    name: 'Run',
                    type: 'running',
                    createdAt: new Date(),
                },
                {
                    id: 'activity-2',
                    name: 'Ride',
                    type: 'cycling',
                    createdAt: new Date(),
                },
            ];

            mockWorkoutRepo.find.mockResolvedValue(activities);

            const result = await getUserActivities('user-123');

            expect(result).toEqual(activities);
            expect(mockWorkoutRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user-123' },
                })
            );
        });

        it('should support pagination', async () => {
            mockWorkoutRepo.find.mockResolvedValue([]);

            await getUserActivities('user-123', 20, 10);

            expect(mockWorkoutRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 20,
                    skip: 10,
                })
            );
        });
    });

    describe('getActivityById', () => {
        it('should get activity by id', async () => {
            const activity = {
                id: 'activity-123',
                name: 'Morning Run',
                type: 'running',
            };

            mockWorkoutRepo.findOne.mockResolvedValue(activity);

            const result = await getActivityById('activity-123');

            expect(result).toEqual(activity);
        });

        it('should return null when activity not found', async () => {
            mockWorkoutRepo.findOne.mockResolvedValue(null);

            const result = await getActivityById('nonexistent');

            expect(result).toBeNull();
        });
    });
});
