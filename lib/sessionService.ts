import api from './api';

// ============================
// Types
// ============================

export interface SessionTeacher {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
}

export interface LiveSession {
    id: string;
    teacher_id: string;
    course_id?: string;
    title: string;
    description?: string;
    scheduled_at: string;
    duration_minutes: number;
    room_id: string;
    max_participants: number;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    started_at?: string;
    ended_at?: string;
    recording_url?: string;
    settings: Record<string, any>;
    created_at: string;
    teacher?: SessionTeacher;
    current_participants?: number;
}

export interface SessionParticipant {
    id: string;
    session_id: string;
    user_id: string;
    role: 'teacher' | 'student';
    joined_at: string;
    left_at?: string;
    user?: SessionTeacher;
}

export interface SessionChatMessage {
    id: string;
    session_id: string;
    user_id: string;
    message: string;
    message_type: 'text' | 'system' | 'emoji';
    created_at: string;
    author?: SessionTeacher;
}

export interface RoomConfig {
    session_id?: string;
    teacher_config: TrackConfig;
    student_config: TrackConfig;
    layout_preset: string;
}

export interface TrackConfig {
    max_video_tracks: number;
    max_audio_tracks: number;
    can_publish: boolean;
    can_subscribe: boolean;
    can_publish_data: boolean;
    can_screen_share: boolean;
    allowed_sources: string[];
}

export interface SessionTrack {
    id: string;
    session_id: string;
    user_id: string;
    track_sid?: string;
    track_source: string;
    label: string;
    is_active: boolean;
    settings: Record<string, any>;
    created_at: string;
    user?: SessionTeacher;
}

export interface LiveKitInfo {
    token: string;
    url: string;
    room_id: string;
}

export interface SessionAnalytics {
    session_id: string;
    total_participants: number;
    total_duration_minutes: number;
    avg_engagement_score: number;
    participants: any[];
}

export interface UserLearningStats {
    total_sessions_attended: number;
    total_learning_minutes: number;
    total_chat_messages: number;
    avg_engagement_score: number;
    streak_days: number;
    longest_streak: number;
    last_session_at?: string;
}

export interface SessionRecording {
    id: string;
    session_id: string;
    recorded_by: string;
    storage_path: string;
    file_size: number;
    duration_seconds: number;
    status: string;
    created_at: string;
}

export interface TeacherProfile {
    id: string;
    user_id: string;
    full_name: string;
    specializations: string[];
    years_experience: number;
    bio: string;
    teach_online: boolean;
    teach_offline: boolean;
    locations: string[];
    price_online: number;
    price_offline: number;
    verification_status: 'pending' | 'approved' | 'rejected';
    avatar_url?: string;
    video_demo_url?: string;
}

export interface Course {
    id: string;
    teacher_id: string;
    title: string;
    description: string;
    price: number;
    duration_weeks: number;
    sessions_per_week: number;
    max_students: number;
    start_date?: string;
    is_online: boolean;
    location?: string;
    status: string;
    created_at: string;
}

export interface TeacherStats {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
}

// ============================
// Session Service
// ============================

class SessionService {
    // ========================================
    // SESSION CRUD
    // ========================================

    async getSessions(params: {
        course_id?: string;
        status?: string;
        teacher_id?: string;
        cursor?: string;
        limit?: number;
    } = {}) {
        try {
            const res = await api.get('/sessions', { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải danh sách buổi học' };
        }
    }

    async getSession(id: string) {
        try {
            const res = await api.get(`/sessions/${id}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tải chi tiết buổi học' };
        }
    }

    async createSession(data: {
        title: string;
        description?: string;
        course_id?: string;
        scheduled_at: string;
        duration_minutes?: number;
        max_participants?: number;
        settings?: Record<string, any>;
    }) {
        try {
            const res = await api.post('/sessions', data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tạo buổi học' };
        }
    }

    async updateSession(id: string, data: Partial<{
        title: string;
        description: string;
        scheduled_at: string;
        duration_minutes: number;
        max_participants: number;
        settings: Record<string, any>;
    }>) {
        try {
            const res = await api.put(`/sessions/${id}`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi cập nhật buổi học' };
        }
    }

    async deleteSession(id: string) {
        try {
            const res = await api.delete(`/sessions/${id}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi hủy buổi học' };
        }
    }

    // ========================================
    // SESSION LIFECYCLE
    // ========================================

    async startSession(id: string): Promise<{ success: boolean; data?: { session: LiveSession; livekit: LiveKitInfo; room_config: TrackConfig }; message?: string }> {
        try {
            const res = await api.post(`/sessions/${id}/start`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi bắt đầu buổi học' };
        }
    }

    async joinSession(id: string): Promise<{ success: boolean; data?: { session: LiveSession; livekit: LiveKitInfo }; message?: string }> {
        try {
            const res = await api.post(`/sessions/${id}/join`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tham gia buổi học' };
        }
    }

    async leaveSession(id: string) {
        try {
            const res = await api.post(`/sessions/${id}/leave`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi rời buổi học' };
        }
    }

    async endSession(id: string) {
        try {
            const res = await api.post(`/sessions/${id}/end`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi kết thúc buổi học' };
        }
    }

    // ========================================
    // PARTICIPANTS
    // ========================================

    async getParticipants(sessionId: string) {
        try {
            const res = await api.get(`/sessions/${sessionId}/participants`);
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi lấy danh sách' };
        }
    }

    // ========================================
    // IN-SESSION CHAT
    // ========================================

    async getChatHistory(sessionId: string, params: { cursor?: string; limit?: number } = {}) {
        try {
            const res = await api.get(`/sessions/${sessionId}/chat`, { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải chat' };
        }
    }

    async sendChatMessage(sessionId: string, message: string, message_type: string = 'text') {
        try {
            const res = await api.post(`/sessions/${sessionId}/chat`, { message, message_type });
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi gửi chat' };
        }
    }

    // ========================================
    // ROOM CONFIG
    // ========================================

    async getRoomConfig(sessionId: string) {
        try {
            const res = await api.get(`/sessions/${sessionId}/room-config`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi lấy cấu hình' };
        }
    }

    async configureRoom(sessionId: string, data: {
        teacher_config?: Partial<TrackConfig>;
        student_config?: Partial<TrackConfig>;
        layout_preset?: string;
    }) {
        try {
            const res = await api.put(`/sessions/${sessionId}/room-config`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi cấu hình phòng' };
        }
    }

    // ========================================
    // TRACKS (Multi-camera)
    // ========================================

    async getTracks(sessionId: string) {
        try {
            const res = await api.get(`/sessions/${sessionId}/tracks`);
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi lấy tracks' };
        }
    }

    async registerTrack(sessionId: string, data: {
        track_sid?: string;
        track_source: string;
        label?: string;
        settings?: Record<string, any>;
    }) {
        try {
            const res = await api.post(`/sessions/${sessionId}/tracks`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi đăng ký track' };
        }
    }

    async updateTrack(sessionId: string, trackId: string, data: Partial<{
        track_sid: string;
        label: string;
        is_active: boolean;
        settings: Record<string, any>;
    }>) {
        try {
            const res = await api.put(`/sessions/${sessionId}/tracks/${trackId}`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi cập nhật track' };
        }
    }

    // ========================================
    // ANALYTICS
    // ========================================

    async recordJoin(sessionId: string, device_info?: Record<string, any>) {
        try {
            const res = await api.post(`/analytics/sessions/${sessionId}/join`, { device_info });
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi ghi nhận' };
        }
    }

    async recordLeave(sessionId: string, data?: {
        engagement_score?: number;
        chat_messages_count?: number;
        connection_quality?: string;
    }) {
        try {
            const res = await api.put(`/analytics/sessions/${sessionId}/leave`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi ghi nhận' };
        }
    }

    async getSessionAnalytics(sessionId: string) {
        try {
            const res = await api.get(`/analytics/sessions/${sessionId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi lấy analytics' };
        }
    }

    async saveRecording(sessionId: string, data: {
        storage_path: string;
        file_size?: number;
        duration_seconds?: number;
    }) {
        try {
            const res = await api.post(`/analytics/sessions/${sessionId}/recordings`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi lưu bản ghi' };
        }
    }

    async getRecordings(sessionId: string) {
        try {
            const res = await api.get(`/analytics/sessions/${sessionId}/recordings`);
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi lấy bản ghi' };
        }
    }

    async getMyStats(): Promise<{ success: boolean; data: UserLearningStats }> {
        try {
            const res = await api.get('/analytics/users/me');
            return res.data;
        } catch (error: any) {
            return {
                success: false,
                data: {
                    total_sessions_attended: 0,
                    total_learning_minutes: 0,
                    total_chat_messages: 0,
                    avg_engagement_score: 0,
                    streak_days: 0,
                    longest_streak: 0,
                }
            };
        }
    }

    async getUserStats(userId: string) {
        try {
            const res = await api.get(`/analytics/users/${userId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi lấy thống kê' };
        }
    }

    // ========================================
    // TEACHER PROFILE & COURSES
    // ========================================

    async getTeacherProfile() {
        try {
            const res = await api.get('/teacher/profile');
            return res.data;
        } catch (error: any) {
            return { success: false, data: null, message: error.response?.data?.message || 'Lỗi lấy profile' };
        }
    }

    async submitTeacherProfile(data: Partial<TeacherProfile>) {
        try {
            const res = await api.post('/teacher/profile', data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi gửi profile' };
        }
    }

    async getMyCourses() {
        try {
            const res = await api.get('/teacher/courses');
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi lấy khóa học' };
        }
    }

    async createCourse(data: {
        title: string;
        description: string;
        price: number;
        duration_weeks: number;
        sessions_per_week?: number;
        max_students?: number;
        start_date?: string;
        is_online?: boolean;
        location?: string;
    }) {
        try {
            const res = await api.post('/teacher/courses', data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tạo khóa học' };
        }
    }

    async getTeacherStats(): Promise<{ success: boolean; data: TeacherStats }> {
        try {
            const res = await api.get('/teacher/stats');
            return res.data;
        } catch (error: any) {
            return { success: false, data: { totalCourses: 0, totalStudents: 0, totalRevenue: 0 } };
        }
    }
}

const sessionService = new SessionService();
export default sessionService;
