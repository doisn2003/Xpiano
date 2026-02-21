import api from './api';

// ============================
// Types
// ============================

export interface PostAuthor {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
}

export interface Post {
    id: string;
    user_id: string;
    content: string;
    media_urls: string[];
    post_type: 'general' | 'course_review' | 'performance' | 'tip';
    visibility: 'public' | 'followers' | 'private';
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
    author?: PostAuthor;
    is_liked?: boolean;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    author?: PostAuthor;
}

export interface UserProfile {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
    bio?: string;
    followers_count?: number;
    following_count?: number;
    is_following?: boolean;
}

export interface LearningStats {
    total_sessions_attended: number;
    total_learning_minutes: number;
    total_chat_messages: number;
    avg_engagement_score: number;
    streak_days: number;
    longest_streak: number;
    last_session_at?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        has_more: boolean;
        next_cursor: string | null;
    };
    message?: string;
}

// ============================
// Learn Service
// ============================

class LearnService {
    // ========================
    // POSTS
    // ========================

    async getFeed(cursor?: string, limit = 20): Promise<PaginatedResponse<Post>> {
        try {
            const params: any = { limit };
            if (cursor) params.cursor = cursor;
            const res = await api.get('/posts/feed', { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải bài viết' };
        }
    }

    async getPost(postId: string) {
        try {
            const res = await api.get(`/posts/${postId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tải bài viết' };
        }
    }

    async getUserPosts(userId: string, cursor?: string, limit = 20): Promise<PaginatedResponse<Post>> {
        try {
            const params: any = { limit };
            if (cursor) params.cursor = cursor;
            const res = await api.get(`/posts/user/${userId}`, { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải bài viết của người dùng' };
        }
    }

    // ========================
    // COURSES (MARKETPLACE)
    // ========================

    async getPublicCourses(params?: any) {
        try {
            const res = await api.get('/courses', { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải danh sách khóa học' };
        }
    }

    async getCourseDetails(courseId: string) {
        try {
            const res = await api.get(`/courses/${courseId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tải chi tiết khóa học' };
        }
    }

    async getMyEnrolledCourses() {
        try {
            const res = await api.get('/courses/me/enrolled');
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải khóa học của tôi' };
        }
    }

    async getAdminCourseStats() {
        try {
            const res = await api.get('/courses/admin/stats');
            return res.data;
        } catch (error: any) {
            return { success: false, data: null, message: error.response?.data?.message || 'Lỗi tải thống kê khóa học admin' };
        }
    }

    async createPost(data: { content: string; media_urls?: string[]; post_type?: string; visibility?: string }) {
        try {
            const res = await api.post('/posts', data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tạo bài viết' };
        }
    }

    async updatePost(postId: string, data: { content?: string; media_urls?: string[]; visibility?: string }) {
        try {
            const res = await api.put(`/posts/${postId}`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi cập nhật' };
        }
    }

    async deletePost(postId: string) {
        try {
            const res = await api.delete(`/posts/${postId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi xóa bài viết' };
        }
    }

    // ========================
    // SOCIAL (Likes, Comments, Follow)
    // ========================

    async likePost(postId: string) {
        try {
            const res = await api.post(`/posts/${postId}/like`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi like' };
        }
    }

    async unlikePost(postId: string) {
        try {
            const res = await api.delete(`/posts/${postId}/like`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi unlike' };
        }
    }

    async getComments(postId: string, cursor?: string, limit = 20): Promise<PaginatedResponse<Comment>> {
        try {
            const params: any = { limit };
            if (cursor) params.cursor = cursor;
            const res = await api.get(`/posts/${postId}/comments`, { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải bình luận' };
        }
    }

    async createComment(postId: string, content: string) {
        try {
            const res = await api.post(`/posts/${postId}/comments`, { content });
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi gửi bình luận' };
        }
    }

    async followUser(userId: string) {
        try {
            const res = await api.post(`/social/users/${userId}/follow`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi follow' };
        }
    }

    async unfollowUser(userId: string) {
        try {
            const res = await api.delete(`/social/users/${userId}/follow`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi unfollow' };
        }
    }

    async getFollowers(userId: string, cursor?: string) {
        try {
            const params: any = {};
            if (cursor) params.cursor = cursor;
            const res = await api.get(`/social/users/${userId}/followers`, { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message };
        }
    }

    async getFollowing(userId: string, cursor?: string) {
        try {
            const params: any = {};
            if (cursor) params.cursor = cursor;
            const res = await api.get(`/social/users/${userId}/following`, { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message };
        }
    }

    async getTeachers() {
        try {
            const res = await api.get('/social/teachers');
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message };
        }
    }

    async getTeacherPublicProfile(userId: string) {
        try {
            const res = await api.get(`/social/teachers/${userId}/public`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message };
        }
    }

    async getTeacherCourses(userId: string) {
        try {
            const res = await api.get(`/social/teachers/${userId}/courses`);
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message };
        }
    }

    async getUserPublicProfile(userId: string) {
        try {
            const res = await api.get(`/social/users/${userId}/public`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message };
        }
    }

    async searchUsers(query: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
        try {
            const res = await api.get('/social/users/search', { params: { q: query } });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tìm kiếm' };
        }
    }

    // ========================
    // ANALYTICS
    // ========================

    async getMyStats(): Promise<{ success: boolean; data?: LearningStats; message?: string }> {
        try {
            const res = await api.get('/analytics/users/me');
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tải thống kê' };
        }
    }

    // ========================
    // MODERATION
    // ========================

    async reportContent(data: { content_type: string; content_id: string; reason: string; description?: string }) {
        try {
            const res = await api.post('/moderation/reports', data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi gửi báo cáo' };
        }
    }
}

export default new LearnService();
