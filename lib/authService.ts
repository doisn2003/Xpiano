import api from './api';

export interface User {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
    role: 'user' | 'admin' | 'teacher';
    is_verified: boolean;
    avatar_url?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: 'user' | 'teacher';
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    }

    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    }

    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
        return response.data;
    }

    async getProfile(): Promise<User> {
        const response = await api.get('/auth/me');
        return response.data.data;
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
}

export default new AuthService();
