import * as jwt from 'jsonwebtoken';
import { generateJwtToken } from '../jwt-service.js';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
    __esModule: true,
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    },
}));

describe('JwtService', () => {
    const mockPayload = { sub: 'user-123' };
    const mockToken = 'mock-token';
    const mockSecret = 'esportz-dev-secret';

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = '';
        process.env.JWT_ACCESS_TOKEN_TTL = '';
    });

    describe('generateJwtToken', () => {
        it('should generate a token with default options', () => {
            // Access the mock directly from the imported module
            // Since we mocked it, import * as jwt returns the mock
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            const result = generateJwtToken(mockPayload);

            expect(result).toBe(mockToken);
            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                mockSecret,
                expect.objectContaining({ expiresIn: '1h' })
            );
        });
    });
});
