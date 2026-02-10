import api from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UploadType = 'avatar' | 'course_video' | 'certificate' | 'piano_image' | 'piano_video';

export interface SignedUrlResponse {
    signedUrl: string;
    token: string;
    path: string;
    fullPath: string;
    publicUrl: string;
}

export interface UploadOptions {
    uploadType: UploadType;
    file: File;
    resourceId?: string; // required for piano_image / piano_video
    onProgress?: (percent: number) => void;
}

export interface UploadResult {
    publicUrl: string;
    path: string;
    fullPath: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov'];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;   // 50MB

const IMAGE_UPLOAD_TYPES: UploadType[] = ['avatar', 'certificate', 'piano_image'];
const VIDEO_UPLOAD_TYPES: UploadType[] = ['course_video', 'piano_video'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop()!.toLowerCase();
}

function isImageType(uploadType: UploadType): boolean {
    return IMAGE_UPLOAD_TYPES.includes(uploadType);
}

function isVideoType(uploadType: UploadType): boolean {
    return VIDEO_UPLOAD_TYPES.includes(uploadType);
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validate file before requesting signed URL.
 * Throws an Error with Vietnamese message if invalid.
 */
function validateFile(file: File, uploadType: UploadType): void {
    const ext = getFileExtension(file.name);

    // Check extension
    if (isImageType(uploadType)) {
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
            throw new Error(`Định dạng ảnh không hợp lệ. Cho phép: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`);
        }
        if (file.size > MAX_IMAGE_SIZE) {
            throw new Error(`Ảnh vượt quá dung lượng cho phép (tối đa ${MAX_IMAGE_SIZE / (1024 * 1024)}MB)`);
        }
    } else if (isVideoType(uploadType)) {
        if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
            throw new Error(`Định dạng video không hợp lệ. Cho phép: ${ALLOWED_VIDEO_EXTENSIONS.join(', ')}`);
        }
        if (file.size > MAX_VIDEO_SIZE) {
            throw new Error(`Video vượt quá dung lượng cho phép (tối đa ${MAX_VIDEO_SIZE / (1024 * 1024)}MB)`);
        }
    }
}

// ─── Service ─────────────────────────────────────────────────────────────────

class UploadService {
    /**
     * Full upload flow:
     * 1. Validate file locally (size, extension)
     * 2. Request signed URL from backend (RBAC enforced server-side)
     * 3. Upload file directly to Supabase Storage using signed URL
     * 4. Return the public URL to store in DB
     */
    async upload({ uploadType, file, resourceId, onProgress }: UploadOptions): Promise<UploadResult> {
        // Step 1: Client-side validation
        validateFile(file, uploadType);

        // Step 2: Get signed URL from backend
        const signedData = await this.getSignedUrl(uploadType, file, resourceId);

        // Step 3: Upload directly to Supabase Storage
        await this.uploadToStorage(signedData.signedUrl, signedData.token, file, onProgress);

        // Step 4: Return metadata for DB storage
        return {
            publicUrl: signedData.publicUrl,
            path: signedData.path,
            fullPath: signedData.fullPath,
        };
    }

    /**
     * Request a signed upload URL from the backend
     */
    private async getSignedUrl(
        uploadType: UploadType,
        file: File,
        resourceId?: string
    ): Promise<SignedUrlResponse> {
        try {
            const response = await api.post('/upload/sign', {
                uploadType,
                fileName: file.name,
                fileSize: file.size,
                contentType: file.type,
                resourceId,
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tạo upload URL');
            }

            return response.data.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Lỗi khi yêu cầu signed URL';
            throw new Error(message);
        }
    }

    /**
     * Upload file to Supabase Storage via signed URL with progress tracking
     */
    private async uploadToStorage(
        signedUrl: string,
        token: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    onProgress?.(100);
                    resolve();
                } else {
                    let errorMsg = 'Upload thất bại';
                    try {
                        const resp = JSON.parse(xhr.responseText);
                        errorMsg = resp.message || resp.error || errorMsg;
                    } catch { /* ignore parse error */ }
                    reject(new Error(errorMsg));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Lỗi mạng khi upload file'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload đã bị hủy'));
            });

            // Supabase signed upload: PUT to the signedUrl with the token
            xhr.open('PUT', signedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });
    }

    /**
     * Delete a file from storage via backend
     */
    async deleteFile(bucket: string, path: string): Promise<void> {
        try {
            const response = await api.delete('/upload/file', {
                data: { bucket, path },
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể xóa file');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Lỗi khi xóa file';
            throw new Error(message);
        }
    }

    /**
     * Convenience: Upload avatar
     */
    async uploadAvatar(file: File, onProgress?: (percent: number) => void): Promise<string> {
        const result = await this.upload({ uploadType: 'avatar', file, onProgress });
        return result.publicUrl;
    }

    /**
     * Convenience: Upload course demo video (teacher)
     */
    async uploadCourseVideo(file: File, onProgress?: (percent: number) => void): Promise<string> {
        const result = await this.upload({ uploadType: 'course_video', file, onProgress });
        return result.publicUrl;
    }

    /**
     * Convenience: Upload certificate image (teacher)
     */
    async uploadCertificate(file: File, onProgress?: (percent: number) => void): Promise<string> {
        const result = await this.upload({ uploadType: 'certificate', file, onProgress });
        return result.publicUrl;
    }

    /**
     * Convenience: Upload piano image (admin)
     */
    async uploadPianoImage(file: File, pianoId: string, onProgress?: (percent: number) => void): Promise<string> {
        const result = await this.upload({ uploadType: 'piano_image', file, resourceId: pianoId, onProgress });
        return result.publicUrl;
    }

    /**
     * Convenience: Upload piano demo video (admin)
     */
    async uploadPianoVideo(file: File, pianoId: string, onProgress?: (percent: number) => void): Promise<string> {
        const result = await this.upload({ uploadType: 'piano_video', file, resourceId: pianoId, onProgress });
        return result.publicUrl;
    }
}

const uploadService = new UploadService();
export default uploadService;
