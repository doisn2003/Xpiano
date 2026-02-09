import { supabase } from './supabase';

export interface UpdateProfileData {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
}

class UserService {
    /**
     * Update user profile
     */
    async updateProfile(data: UpdateProfileData): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Bạn cần đăng nhập');

            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id);

            if (error) throw error;

            // Also update user metadata
            if (data.full_name) {
                await supabase.auth.updateUser({
                    data: { full_name: data.full_name }
                });
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(newPassword: string): Promise<void> {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    /**
     * Upload avatar
     */
    async uploadAvatar(file: File): Promise<string> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Bạn cần đăng nhập');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    /**
     * Get all users (Admin only)
     */
    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    /**
     * Update user role (Admin only)
     */
    async updateUserRole(userId: string, role: 'user' | 'teacher' | 'admin'): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    /**
     * Delete user (Admin only)
     */
    async deleteUser(userId: string): Promise<void> {
        try {
            // Note: This requires service_role key in production
            // For now, we'll just soft-delete by updating a flag
            const { error } = await supabase
                .from('profiles')
                .update({ deleted_at: new Date().toISOString() } as any)
                .eq('id', userId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Get user statistics (Admin)
     */
    async getUserStats() {
        try {
            const { data: users, error } = await supabase
                .from('profiles')
                .select('role');

            if (error) throw error;

            const stats = {
                total: users?.length || 0,
                users: users?.filter(u => u.role === 'user').length || 0,
                teachers: users?.filter(u => u.role === 'teacher').length || 0,
                admins: users?.filter(u => u.role === 'admin').length || 0,
            };

            return stats;
        } catch (error: any) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }
}

export default new UserService();
