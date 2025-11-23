describe('MulterMiddleware', () => {
    let multer: any;
    let upload: any;
    let mockStorage: any;
    let mockLimits: any;
    let mockFileFilter: any;

    beforeEach(() => {
        jest.resetModules();

        jest.doMock('multer', () => {
            const mockMulter = jest.fn((options) => {
                mockStorage = options.storage;
                mockLimits = options.limits;
                mockFileFilter = options.fileFilter;
                return {
                    fields: jest.fn(),
                };
            });
            // Add static methods
            (mockMulter as any).memoryStorage = jest.fn().mockReturnValue('memory-storage');
            return mockMulter;
        });

        multer = require('multer');
        const middleware = require('../multer-middleware');
        upload = middleware.upload;
    });

    it('should configure multer with correct options', () => {
        expect(multer).toHaveBeenCalledWith(expect.objectContaining({
            storage: 'memory-storage',
            limits: {
                fileSize: 100 * 1024 * 1024,
                files: 2,
            },
        }));
    });

    it('should filter files correctly', () => {
        const cb = jest.fn();
        
        // Test valid video
        mockFileFilter({} as any, { mimetype: 'video/mp4' } as any, cb as any);
        expect(cb).toHaveBeenCalledWith(null, true);

        // Test valid image
        mockFileFilter({} as any, { mimetype: 'image/jpeg' } as any, cb as any);
        expect(cb).toHaveBeenCalledWith(null, true);

        // Test invalid type
        mockFileFilter({} as any, { mimetype: 'application/pdf' } as any, cb as any);
        expect(cb).toHaveBeenCalledWith(expect.any(Error));
        expect(cb.mock.calls[2][0].message).toBe('Only video and image files are allowed');
    });
});
