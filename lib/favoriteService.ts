import { supabase } from './supabase';

export interface Favorite {
    id: number;
    user_id: string;
    piano_id: number;
    created_at: string;
}

export interface FavoriteWithPiano extends Favorite {
    piano: {
        id: number;
        name: string;
        image_url: string;
        category: string;
        price_per_hour: number;
        rating: number;
    };
}

class FavoriteService {
    /**
     * Get all favorites for current user
     */
    async getMyFavorites(): Promise<FavoriteWithPiano[]> {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select(`
          *,
          piano:pianos(id, name, image_url, category, price_per_hour, rating)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('Error fetching favorites:', error);
            throw error;
        }
    }

    /**
     * Check if piano is favorited by current user
     */
    async isFavorited(pianoId: number): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data, error } = await supabase
                .from('favorites')
                .select('id')
                .eq('piano_id', pianoId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            return !!data;
        } catch (error: any) {
            console.error('Error checking favorite:', error);
            return false;
        }
    }

    /**
     * Add piano to favorites
     */
    async addFavorite(pianoId: number): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Bạn cần đăng nhập để thêm yêu thích');

            const { error } = await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    piano_id: pianoId,
                });

            if (error) {
                if (error.code === '23505') {
                    throw new Error('Đàn này đã có trong danh sách yêu thích');
                }
                throw error;
            }
        } catch (error: any) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    }

    /**
     * Remove piano from favorites
     */
    async removeFavorite(pianoId: number): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Bạn cần đăng nhập');

            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('piano_id', pianoId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    }

    /**
     * Toggle favorite status
     */
    async toggleFavorite(pianoId: number): Promise<boolean> {
        try {
            const isFav = await this.isFavorited(pianoId);

            if (isFav) {
                await this.removeFavorite(pianoId);
                return false;
            } else {
                await this.addFavorite(pianoId);
                return true;
            }
        } catch (error: any) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    }

    /**
     * Get favorite count for a piano
     */
    async getFavoriteCount(pianoId: number): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('piano_id', pianoId);

            if (error) throw error;
            return count || 0;
        } catch (error: any) {
            console.error('Error getting favorite count:', error);
            return 0;
        }
    }
}

export default new FavoriteService();
