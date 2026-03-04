'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary.
 * Accepts a base64-encoded data URI or a remote URL.
 * Returns the secure URL and public ID.
 */
export async function uploadImage(dataUri, options = {}) {
    try {
        if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
            // Fallback: return the input as-is when Cloudinary isn't configured
            console.warn('Cloudinary not configured — returning input as-is');
            return { success: true, url: dataUri, publicId: null, fallback: true };
        }

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: options.folder || 'unizy',
            resource_type: 'auto',
            transformation: options.transformation || [
                { width: 800, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
            ],
        });

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { error: 'Failed to upload image.' };
    }
}

/**
 * Delete an image from Cloudinary by public ID.
 */
export async function deleteImage(publicId) {
    try {
        if (!publicId || !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
            return { success: true };
        }

        await cloudinary.uploader.destroy(publicId);
        return { success: true };
    } catch (error) {
        console.error('Delete image error:', error);
        return { error: 'Failed to delete image.' };
    }
}

/**
 * Upload a profile picture — optimized sizing for avatars.
 * @todo Implement actual upload logic once frontend supports it
 */
// eslint-disable-next-line no-unused-vars
export async function uploadProfilePicture(dataUri) {
    // Stub implementation to prevent unused export warnings
    // and keep the interface ready for future integration.
    console.warn('uploadProfilePicture is not implemented yet. Received:', !!dataUri);
    return { error: 'Not implemented yet', fallback: true };
}

/**
 * Upload a housing listing image — wider format.
 */
export async function uploadListingImage(dataUri) {
    return uploadImage(dataUri, {
        folder: 'unizy/listings',
        transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
        ],
    });
}

/**
 * Upload a verification document (higher quality, no aggressive crop).
 */
export async function uploadVerificationDoc(dataUri) {
    return uploadImage(dataUri, {
        folder: 'unizy/verifications',
        transformation: [
            { width: 1600, crop: 'limit', quality: 'auto:best', fetch_format: 'auto' }
        ],
    });
}
