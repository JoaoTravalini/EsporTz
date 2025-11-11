import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

export interface UploadResult {
    url: string;
    publicId: string;
    thumbnail?: string;
    duration?: number;
}

export async function uploadMedia(file: Express.Multer.File, type: 'video' | 'image'): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            resource_type: type,
            folder: 'esportz',
            use_filename: true,
            unique_filename: false,
            overwrite: true
        };

        if (type === 'video') {
            uploadOptions.transformation = [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 1920, height: 1080, crop: 'limit' }
            ];
        } else if (type === 'image') {
            uploadOptions.transformation = [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 1200, height: 800, crop: 'limit' }
            ];
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    const uploadResult: UploadResult = {
                        url: result.secure_url,
                        publicId: result.public_id,
                        duration: result.duration || undefined
                    };

                    // Generate thumbnail for videos
                    if (type === 'video' && result.secure_url) {
                        cloudinary.url(result.public_id, {
                            resource_type: 'video',
                            transformation: [
                                { width: 400, height: 300, crop: 'fill' },
                                { start_offset: 1 }
                            ]
                        });

                        // Generate thumbnail URL manually
                        uploadResult.thumbnail = result.secure_url.replace(/\.[^.]+$/, '.jpg').replace('/upload/', '/upload/c_fill,w_400,h_300/');
                    }

                    resolve(uploadResult);
                }
            }
        );

        // Create a readable stream from the buffer
        const readableStream = Readable.from(file.buffer);
        readableStream.pipe(uploadStream);
    });
}

export async function deleteMedia(publicId: string, resourceType: 'video' | 'image' = 'image'): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Error deleting media:', error);
        throw error;
    }
}

export async function generateVideoThumbnail(videoUrl: string): Promise<string> {
    try {
        const result = await cloudinary.url(videoUrl, {
            resource_type: 'video',
            transformation: [
                { width: 400, height: 300, crop: 'fill' },
                { start_offset: 1 }
            ]
        });

        return result;
    } catch (error) {
        console.error('Error generating video thumbnail:', error);
        throw error;
    }
}