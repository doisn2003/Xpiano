import api from './api';

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
    bundle_8_sessions: number;
    bundle_8_discount: string;
    bundle_12_sessions: number;
    bundle_12_discount: string;
    allow_trial_lesson: boolean;
    id_number?: string;
    id_front_url?: string;
    id_back_url?: string;
    bank_name?: string;
    bank_account?: string;
    account_holder?: string;
    certificates_description?: string;
    certificate_urls?: string[];
    avatar_url?: string;
    video_demo_url?: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    rejected_reason?: string;
    approved_at?: string;
    created_at: string;
    updated_at: string;
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
    start_date: string;
    schedule: { day_of_week: number; time: string }[];
    is_online: boolean;
    location?: string;
    status: 'active' | 'completed' | 'cancelled';
    created_at: string;
}

export interface TeacherStats {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    chartData?: {
        month: string;
        yearMonth: string;
        revenue: number;
        students: number;
    }[];
}

class TeacherService {
    /**
     * Get teacher's profile
     */
    async getMyProfile(): Promise<TeacherProfile | null> {
        try {
            const response = await api.get('/teacher/profile');
            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    }

    /**
     * Submit teacher profile for approval
     */
    async submitProfile(profileData: Partial<TeacherProfile>): Promise<{ success: boolean; message: string; data?: TeacherProfile }> {
        try {
            const response = await api.post('/teacher/profile', profileData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi hồ sơ');
        }
    }

    /**
     * Get teacher's courses
     */
    async getMyCourses(): Promise<Course[]> {
        try {
            const response = await api.get('/courses/me/teaching');
            return response.data.data || [];
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    }

    /**
     * Create a new course
     */
    async createCourse(courseData: Partial<Course>): Promise<{ success: boolean; message: string; data?: Course }> {
        try {
            const response = await api.post('/courses', courseData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học');
        }
    }

    /**
     * Publish a course
     */
    async publishCourse(courseId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post(`/courses/${courseId}/publish`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi xuất bản khóa học');
        }
    }

    /**
     * Get teacher statistics
     */
    async getStats(): Promise<TeacherStats> {
        try {
            const response = await api.get('/teacher/stats');
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    }
}

export default new TeacherService();
