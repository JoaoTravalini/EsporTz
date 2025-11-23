describe('Strava Token Service', () => {
    let upsertStravaToken: any;
    let refreshStravaAccessToken: any;
    let mockRefreshTokenRepo: any;

    beforeEach(() => {
        jest.resetModules();

        mockRefreshTokenRepo = {
            findOne: jest.fn(),
            merge: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockRefreshTokenRepo),
            },
        }));

        const stravaTokenServiceModule = require('../strava-token-service');
        upsertStravaToken = stravaTokenServiceModule.upsertStravaToken;
        refreshStravaAccessToken = stravaTokenServiceModule.refreshStravaAccessToken;
    });

    describe('upsertStravaToken', () => {
        it('should create new token when none exists', async () => {
            const payload = {
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
                expires_at: 1700000000,
                athlete: { id: 12345 },
            };

            mockRefreshTokenRepo.findOne.mockResolvedValue(null);
            mockRefreshTokenRepo.create.mockReturnValue({
                provider: 'strava',
                providerUserId: '12345',
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            });
            mockRefreshTokenRepo.save.mockResolvedValue({
                id: 'token-123',
                provider: 'strava',
                providerUserId: '12345',
                accessToken: 'new-access-token',
            });

            const result = await upsertStravaToken(payload);

            expect(result.token).toBeDefined();
            expect(result.raw).toEqual(payload);
            expect(mockRefreshTokenRepo.create).toHaveBeenCalled();
        });

        it('should update existing token', async () => {
            const payload = {
                access_token: 'updated-access-token',
                refresh_token: 'updated-refresh-token',
                expires_at: 1700000000,
                athlete: { id: 12345 },
            };

            const existingToken = {
                id: 'token-123',
                provider: 'strava',
                providerUserId: '12345',
                accessToken: 'old-access-token',
                refreshToken: 'old-refresh-token',
            };

            mockRefreshTokenRepo.findOne.mockResolvedValue(existingToken);
            mockRefreshTokenRepo.merge.mockReturnValue({
                ...existingToken,
                accessToken: 'updated-access-token',
                refreshToken: 'updated-refresh-token',
            });
            mockRefreshTokenRepo.save.mockResolvedValue({
                ...existingToken,
                accessToken: 'updated-access-token',
            });

            const result = await upsertStravaToken(payload);

            expect(result.token.accessToken).toBe('updated-access-token');
            expect(mockRefreshTokenRepo.merge).toHaveBeenCalled();
        });

        it('should throw error when athlete id is missing', async () => {
            const payload = {
                access_token: 'access-token',
                refresh_token: 'refresh-token',
                expires_at: 1700000000,
            };

            await expect(upsertStravaToken(payload)).rejects.toThrow(
                'Strava token payload does not include athlete id'
            );
        });

        it('should convert athlete id to string', async () => {
            const payload = {
                access_token: 'access-token',
                refresh_token: 'refresh-token',
                expires_at: 1700000000,
                athlete: { id: 12345 },
            };

            mockRefreshTokenRepo.findOne.mockResolvedValue(null);
            mockRefreshTokenRepo.create.mockImplementation((data:any) => data);
            mockRefreshTokenRepo.save.mockImplementation((data:any) => ({
                ...data,
                id: 'token-123',
            }));

            await upsertStravaToken(payload);

            expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    providerUserId: '12345',
                })
            );
        });
    });

    describe('refreshStravaAccessToken', () => {
        beforeEach(() => {
            process.env.STRAVA_CLIENT_ID = 'test-client-id';
            process.env.STRAVA_SECRET_CLIENT = 'test-client-secret';
        });

        afterEach(() => {
            delete process.env.STRAVA_CLIENT_ID;
            delete process.env.STRAVA_SECRET_CLIENT;
        });

        it('should return undefined if token record not found', async () => {
            mockRefreshTokenRepo.findOne.mockResolvedValue(null);

            const result = await refreshStravaAccessToken({ providerUserId: '12345' });

            expect(result).toBeUndefined();
        });

        it('should throw error if Strava credentials not configured', async () => {
            delete process.env.STRAVA_CLIENT_ID;

            mockRefreshTokenRepo.findOne.mockResolvedValue({
                id: 'token-123',
                refreshToken: 'refresh-token',
            });

            await expect(
                refreshStravaAccessToken({ providerUserId: '12345' })
            ).rejects.toThrow('Strava credentials are not configured');
        });

        it('should refresh access token successfully', async () => {
            const existingToken = {
                id: 'token-123',
                provider: 'strava',
                providerUserId: '12345',
                refreshToken: 'old-refresh-token',
            };

            const newTokenResponse = {
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
                expires_at: 1700000000,
                athlete: { id: 12345 },
            };

            mockRefreshTokenRepo.findOne
                .mockResolvedValueOnce(existingToken)
                .mockResolvedValueOnce(null);
            mockRefreshTokenRepo.create.mockReturnValue({
                ...existingToken,
                accessToken: 'new-access-token',
            });
            mockRefreshTokenRepo.save.mockResolvedValue({
                ...existingToken,
                accessToken: 'new-access-token',
            });

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(newTokenResponse),
            } as any);

            const result = await refreshStravaAccessToken({ providerUserId: '12345' });

            expect(result).toBeDefined();
            expect(result?.raw).toEqual(newTokenResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://www.strava.com/oauth/token',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });

        it('should handle failed token refresh', async () => {
            const existingToken = {
                id: 'token-123',
                refreshToken: 'refresh-token',
            };

            mockRefreshTokenRepo.findOne.mockResolvedValue(existingToken);

            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValue({ error: 'invalid_token' }),
            } as any);

            await expect(
                refreshStravaAccessToken({ providerUserId: '12345' })
            ).rejects.toThrow('Failed to refresh Strava token');
        });
    });
});
