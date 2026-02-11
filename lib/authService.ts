import api from './api';

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role: 'user' | 'admin' | 'teacher' | 'warehouse_owner';
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

export interface AdminLoginCredentials {
    email: string;
    password: string;
    role: 'admin' | 'warehouse_owner';
}

export interface AdminRegisterData {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: 'admin' | 'warehouse_owner';
    token: string;
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
                const { user, token, refresh_token, expires_at } = response.data.data;
                this.setSession(user, token, refresh_token, expires_at);
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
     * Send OTP for verification
     */
    async sendOtp(email: string, type: 'signup' | 'recovery' | 'magiclink' = 'signup'): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post('/auth/send-otp', { email, type });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã',
            };
        }
    }

    /**
     * Register with OTP verification
     */
    async registerVerify(data: RegisterData & { token: string, date_of_birth?: string }): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/register-verify', data);

            if (response.data.success) {
                const { user, token, refresh_token, expires_at } = response.data.data;
                this.setSession(user, token, refresh_token, expires_at);
                return response.data; // Return full response for handling
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
     * Login with OTP (Magic Link logic but with code input)
     */
    async loginOtp(email: string, token: string): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/login-otp', { email, token });

            if (response.data.success) {
                const { user, token: accessToken, refresh_token, expires_at } = response.data.data;
                this.setSession(user, accessToken, refresh_token, expires_at);
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
     * Admin login - validates role on server
     */
    async adminLogin(credentials: AdminLoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/admin-login', credentials);

            if (response.data.success) {
                const { user, token, refresh_token, expires_at } = response.data.data;
                this.setSession(user, token, refresh_token, expires_at);
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
     * Admin / Warehouse Owner register with OTP
     */
    async adminRegister(data: AdminRegisterData): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/admin-register', data);

            if (response.data.success) {
                const { user, token } = response.data.data;
                this.setSession(user, token);
                return response.data;
            }

            return {
                success: false,
                message: response.data.message || 'Đăng ký thất bại',
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
     * Forgot password - request OTP
     */
    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        return this.sendOtp(email, 'recovery');
    }

    /**
     * Reset password with OTP
     */
    async resetPassword(newPassword: string, email?: string, token?: string): Promise<{ success: boolean; message: string }> {
        try {
            // Check if we are doing OTP flow (email + token provided)
            if (email && token) {
                const response = await api.post('/auth/reset-password', { email, token, new_password: newPassword });
                return response.data;
            }

            // Fallback to authenticated reset (if logged in)
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
     * Refresh the access token using refresh_token
     */
    async refreshAccessToken(): Promise<boolean> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                console.log('No refresh token available');
                return false;
            }

            const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
            
            if (response.data.success) {
                const { token, refresh_token, expires_at } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('refresh_token', refresh_token);
                if (expires_at) {
                    localStorage.setItem('token_expires_at', expires_at.toString());
                }
                console.log('Token refreshed successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // Clear session on refresh failure
            this.clearSession();
            return false;
        }
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    /**
     * Helper to set session
     */
    private setSession(user: User, token: string, refreshToken?: string, expiresAt?: number) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
        if (expiresAt) {
            localStorage.setItem('token_expires_at', expiresAt.toString());
        }
        // Trigger event if needed, or use a state manager like Context/Redux
        window.dispatchEvent(new Event('auth-change'));
    }

    /**
     * Helper to clear session
     */
    private clearSession() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
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
