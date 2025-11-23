describe('updateUser', () => {
    let updateUser: any;
    let updateUserPreferences: any;
    let mockUserRepo: any;
    let mockDriver: any;

    beforeEach(() => {
        jest.resetModules();

        mockUserRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        mockDriver = {
            executeQuery: jest.fn().mockResolvedValue(undefined),
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockUserRepo),
            },
        }));

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: mockDriver,
        }));

        const updateUserModule = require('../update-user');
        updateUser = updateUserModule.updateUser;
        updateUserPreferences = updateUserModule.updateUserPreferences;
    });

    describe('updateUser', () => {
        it('should return undefined if user does not exist', async () => {
            mockUserRepo.findOne.mockResolvedValue(null);

            const result = await updateUser({ userId: 'user-123', name: 'New Name' });

            expect(result).toBeUndefined();
        });

        it('should update user name', async () => {
            const user = {
                id: 'user-123',
                name: 'Old Name',
                bio: 'Bio',
                imgURL: null,
            };

            const updatedUser = { ...user, name: 'New Name' };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(updatedUser);

            const result = await updateUser({ userId: 'user-123', name: 'New Name' });

            expect(mockUserRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'New Name' })
            );
            expect(result).toEqual(updatedUser);
        });

        it('should update multiple fields', async () => {
            const user = {
                id: 'user-123',
                name: 'Old Name',
                bio: 'Old bio',
                location: 'Old location',
                website: null,
                imgURL: null,
            };

            const updatedUser = {
                ...user,
                name: 'New Name',
                bio: 'New bio',
                location: 'New location',
                website: 'https://example.com',
            };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(updatedUser);

            const result = await updateUser({
                userId: 'user-123',
                name: 'New Name',
                bio: 'New bio',
                location: 'New location',
                website: 'https://example.com',
            });

            expect(mockUserRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Name',
                    bio: 'New bio',
                    location: 'New location',
                    website: 'https://example.com',
                })
            );
            expect(result).toEqual(updatedUser);
        });

        it('should only update provided fields', async () => {
            const user = {
                id: 'user-123',
                name: 'Name',
                bio: 'Old bio',
                location: 'Location',
                website: null,
                imgURL: null,
            };

            const updatedUser = { ...user, bio: 'New bio' };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(updatedUser);

            const result = await updateUser({
                userId: 'user-123',
                bio: 'New bio',
            });

            expect(mockUserRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Name', // Unchanged
                    bio: 'New bio', // Changed
                    location: 'Location', // Unchanged
                })
            );
        });

        it('should sync user to Neo4j after update', async () => {
            const user = {
                id: 'user-123',
                name: 'Old Name',
                imgURL: 'old.jpg',
            };

            const updatedUser = {
                ...user,
                name: 'New Name',
                imgURL: 'new.jpg',
            };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(updatedUser);

            await updateUser({
                userId: 'user-123',
                name: 'New Name',
                imgURL: 'new.jpg',
            });

            expect(mockDriver.executeQuery).toHaveBeenCalledWith(
                expect.stringContaining('MERGE (u:User {id: $userId})'),
                {
                    userId: 'user-123',
                    name: 'New Name',
                    imgURL: 'new.jpg',
                }
            );
        });

        it('should handle Neo4j sync failure gracefully', async () => {
            const user = { id: 'user-123', name: 'Name', imgURL: null };
            const updatedUser = { ...user, name: 'New Name' };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(updatedUser);
            mockDriver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = await updateUser({
                userId: 'user-123',
                name: 'New Name',
            });

            expect(result).toBeDefined();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to sync user to Neo4j:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('updateUserPreferences', () => {
        it('should return undefined if user does not exist', async () => {
            mockUserRepo.findOne.mockResolvedValue(null);

            const result = await updateUserPreferences({
                userId: 'user-123',
                preferences: { favoriteSports: ['Football'] },
            });

            expect(result).toBeUndefined();
        });

        it('should update user preferences', async () => {
            const user = {
                id: 'user-123',
                preferences: {
                    favoriteSports: ['Basketball'],
                    notifications: {
                        highlights: true,
                        analyses: true,
                        matches: true,
                        followedTeams: true,
                    },
                    privacy: {
                        profilePublic: true,
                        showStats: true,
                        allowAnalysisSharing: true,
                    },
                },
            };

            const updatedUser = {
                ...user,
                preferences: {
                    favoriteSports: ['Football', 'Soccer'],
                    notifications: user.preferences.notifications,
                    privacy: user.preferences.privacy,
                },
            };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(updatedUser);

            const result = await updateUserPreferences({
                userId: 'user-123',
                preferences: { favoriteSports: ['Football', 'Soccer'] },
            });

            expect(mockUserRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    preferences: expect.objectContaining({
                        favoriteSports: ['Football', 'Soccer'],
                    }),
                })
            );
            expect(result).toEqual(updatedUser);
        });

        it('should merge partial notification preferences', async () => {
            const user = {
                id: 'user-123',
                preferences: {
                    favoriteSports: [],
                    notifications: {
                        highlights: true,
                        analyses: true,
                        matches: true,
                        followedTeams: true,
                    },
                    privacy: {
                        profilePublic: true,
                        showStats: true,
                        allowAnalysisSharing: true,
                    },
                },
            };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(user);

            await updateUserPreferences({
                userId: 'user-123',
                preferences: {
                    notifications: { highlights: false },
                },
            });

            expect(mockUserRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    preferences: expect.objectContaining({
                        notifications: {
                            highlights: false,
                            analyses: true,
                            matches: true,
                            followedTeams: true,
                        },
                    }),
                })
            );
        });

        it('should initialize default preferences if none exist', async () => {
            const user = {
                id: 'user-123',
                preferences: null,
            };

            mockUserRepo.findOne.mockResolvedValue(user);
            mockUserRepo.save.mockResolvedValue(user);

            await updateUserPreferences({
                userId: 'user-123',
                preferences: {
                    favoriteSports: ['Tennis'],
                },
            });

            expect(mockUserRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    preferences: {
                        favoriteSports: ['Tennis'],
                        notifications: expect.any(Object),
                        privacy: expect.any(Object),
                    },
                })
            );
        });
    });
});
