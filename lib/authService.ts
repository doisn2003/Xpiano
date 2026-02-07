import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
    };
}

class AuthService {
    /**
     * Convert Supabase User to our User type
     */
    private async getCurrentUserProfile(supabaseUser: SupabaseUser): Promise<User> {
        // Get profile from profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (error || !profile) {
            // Fallback to metadata if profile doesn't exist yet
            return {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                full_name: supabaseUser.user_metadata?.full_name || 'User',
                phone: supabaseUser.user_metadata?.phone,
                role: supabaseUser.user_metadata?.role || 'user',
                is_verified: supabaseUser.email_confirmed_at !== null,
                avatar_url: supabaseUser.user_metadata?.avatar_url,
            };
        }

        return {
            id: profile.id,
            email: supabaseUser.email!,
            full_name: profile.full_name,
            phone: profile.phone,
            role: profile.role,
            is_verified: supabaseUser.email_confirmed_at !== null,
            avatar_url: profile.avatar_url,
        };
    }

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });

            if (error) {
                return {
                    success: false,
                    message: this.translateError(error.message),
                    data: { user: null as any },
                };
            }

            if (!data.user) {
                return {
                    success: false,
                    message: 'Đăng nhập thất bại',
                    data: { user: null as any },
                };
            }

            const user = await this.getCurrentUserProfile(data.user);

            // Save to localStorage for compatibility
            localStorage.setItem('user', JSON.stringify(user));

            return {
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    user,
                    token: data.session?.access_token,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Có lỗi xảy ra',
                data: { user: null as any },
            };
        }
    }

    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                        phone: data.phone,
                        role: data.role || 'user',
                    },
                },
            });

            if (error) {
                return {
                    success: false,
                    message: this.translateError(error.message),
                    data: { user: null as any },
                };
            }

            if (!authData.user) {
                return {
                    success: false,
                    message: 'Đăng ký thất bại',
                    data: { user: null as any },
                };
            }

            const user = await this.getCurrentUserProfile(authData.user);

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(user));

            return {
                success: true,
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
                data: {
                    user,
                    token: authData.session?.access_token,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Có lỗi xảy ra',
                data: { user: null as any },
            };
        }
    }

    /**
     * Forgot password - Send reset email
     */
    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                return {
                    success: false,
                    message: this.translateError(error.message),
                };
            }

            return {
                success: true,
                message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn',
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Có lỗi xảy ra',
            };
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                return {
                    success: false,
                    message: this.translateError(error.message),
                };
            }

            return {
                success: true,
                message: 'Mật khẩu đã được đặt lại thành công',
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Có lỗi xảy ra',
            };
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(): Promise<User | null> {
        try {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();

            if (!supabaseUser) {
                return null;
            }

            return await this.getCurrentUserProfile(supabaseUser);
        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    }

    /**
     * Logout
     */
    async logout(): Promise<void> {
        await supabase.auth.signOut();
        localStorage.removeItem('user');
    }

    /**
     * Get current user from localStorage (for immediate access)
     */
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    }

    /**
     * Translate Supabase errors to Vietnamese
     */
    private translateError(message: string): string {
        const errorMap: Record<string, string> = {
            'Invalid login credentials': 'Email hoặc mật khẩu không chính xác',
            'User already registered': 'Email đã được đăng ký',
            'Email not confirmed': 'Email chưa được xác thực',
            'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
            'Unable to validate email address': 'Email không hợp lệ',
            'User not found': 'Không tìm thấy người dùng',
        };

        for (const [key, value] of Object.entries(errorMap)) {
            if (message.includes(key)) {
                return value;
            }
        }

        return message;
    }

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (user: User | null) => void) {
        return supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const user = await this.getCurrentUserProfile(session.user);
                localStorage.setItem('user', JSON.stringify(user));
                callback(user);
            } else {
                localStorage.removeItem('user');
                callback(null);
            }
        });
    }
}

export default new AuthService();
