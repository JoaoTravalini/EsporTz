import multer from 'multer';

// Configure multer for file uploads
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 2 // Max 2 files (video + thumbnail)
    },
    fileFilter: (req, file, cb) => {
        // Allow video and image files
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video and image files are allowed'));
        }
    }
});
