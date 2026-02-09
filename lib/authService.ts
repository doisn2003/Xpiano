import api from './api';

export interface User {
    id: string;
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
        token?: string;
        session?: any;
    };
}

class AuthService {
    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/login', credentials);

            if (response.data.success) {
                const { user, token } = response.data.data;
                this.setSession(user, token);
                return response.data;
            }

            return {
                success: false,
                message: response.data.message || 'Đăng nhập thất bại',
                data: { user: null as any },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra',
                data: { user: null as any },
            };
        }
    }

    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/register', data);

            // Note: Register usually doesn't return a session if email confirm is required
            // But if it does, we can set it.
            if (response.data.success && response.data.data?.token) {
                const { user, token } = response.data.data;
                this.setSession(user, token);
            }

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra',
                data: { user: null as any },
            };
        }
    }

    /**
     * Forgot password - Send reset email
     */
    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra',
            };
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            // Token is expected to be in headers via interceptor if user is logged in
            // Or passed in body if we are using a token from URL.
            // Our backend resetPassword expects authenticated user usually.
            const response = await api.post('/auth/reset-password', { new_password: newPassword });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra',
            };
        }
    }

    /**
     * Get current user profile from Backend
     */
    async getProfile(): Promise<User | null> {
        try {
            if (!this.isAuthenticated()) return null;

            const response = await api.get('/auth/me');
            if (response.data.success) {
                // Update local user data
                localStorage.setItem('user', JSON.stringify(response.data.data));
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error getting profile:', error);
            // If 401, clear session
            this.logout();
            return null;
        }
    }

    /**
     * Logout
     */
    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // Ignore error
        } finally {
            this.clearSession();
        }
    }

    /**
     * Get current user from localStorage (for immediate access)
     */
    getCurrentUser(): User | null {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    }

    /**
     * Check if user is authenticated (has token)
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    /**
     * Helper to set session
     */
    private setSession(user: User, token: string) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        // Trigger event if needed, or use a state manager like Context/Redux
        window.dispatchEvent(new Event('auth-change'));
    }

    /**
     * Helper to clear session
     */
    private clearSession() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-change'));
    }
    /**
     * Listen to auth state changes (simulated for compatibility)
     */
    onAuthStateChange(callback: (user: User | null) => void) {
        const handler = () => {
            const user = this.getCurrentUser();
            callback(user);
        };

        // Listen to our custom event
        window.addEventListener('auth-change', handler);

        // Initial call
        handler();

        // Return subscription object compatible with Supabase's signature
        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        window.removeEventListener('auth-change', handler);
                    }
                }
            }
        };
    }
}

export default new AuthService();
