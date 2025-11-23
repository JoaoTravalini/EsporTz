describe('createUser', () => {
    let createUser: any;
    let getUser: any;
    let mockRepo: any;
    let mockCreate: jest.Mock;
    let mockSave: jest.Mock;
    let driver: any;

    beforeEach(() => {
        jest.resetModules();

        mockCreate = jest.fn();
        mockSave = jest.fn();
        mockRepo = {
            create: mockCreate,
            save: mockSave,
        };

        jest.doMock('../../database/postgres/data-source', () => ({
            AppDataSource: {
                getRepository: jest.fn(() => mockRepo),
            },
        }));

        jest.doMock('../get-user', () => ({
            getUser: jest.fn(),
        }));

        jest.doMock('../../database/neo4j/data-source', () => ({
            driver: {
                executeQuery: jest.fn(),
            },
        }));

        // Import the module under test
        // We need to use require because we are inside a function
        const createUserModule = require('../create-user');
        createUser = createUserModule.createUser;
        
        const getUserModule = require('../get-user');
        getUser = getUserModule.getUser;

        const driverModule = require('../../database/neo4j/data-source');
        driver = driverModule.driver;
    });

    it('should create a user successfully when email does not exist', async () => {
        const payload = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        };

        getUser.mockResolvedValue(null);
        mockCreate.mockReturnValue({ ...payload, id: 'user-123' });
        mockSave.mockResolvedValue({ ...payload, id: 'user-123' });

        const result = await createUser(payload);

        expect(getUser).toHaveBeenCalledWith({ email: payload.email });
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            email: payload.email,
            provider: 'email',
        }));
        expect(mockSave).toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining({ id: 'user-123' }));
        expect(driver.executeQuery).toHaveBeenCalled();
    });

    it('should return existing user if email already exists', async () => {
        const payload = {
            email: 'existing@example.com',
            password: 'password123',
            name: 'Existing User',
        };

        const existingUser = { id: 'existing-123', ...payload };
        getUser.mockResolvedValue(existingUser);

        const result = await createUser(payload);

        expect(getUser).toHaveBeenCalledWith({ email: payload.email });
        expect(mockCreate).not.toHaveBeenCalled();
        expect(mockSave).not.toHaveBeenCalled();
        expect(result).toEqual(existingUser);
    });

    it('should handle Neo4j sync failure gracefully', async () => {
        const payload = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        };

        getUser.mockResolvedValue(null);
        mockCreate.mockReturnValue({ ...payload, id: 'user-123' });
        mockSave.mockResolvedValue({ ...payload, id: 'user-123' });
        driver.executeQuery.mockRejectedValue(new Error('Neo4j error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await createUser(payload);

        expect(result).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to mirror user node', expect.any(Error));
        
        consoleSpy.mockRestore();
    });
});
