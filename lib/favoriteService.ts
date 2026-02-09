import api from './api';

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
            const response = await api.get('/favorites');
            if (response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (error: any) {
            console.error('Error fetching favorites:', error);
            // If 401, maybe return empty? Or let AuthContext handle?
            return [];
        }
    }

    /**
     * Check if piano is favorited by current user
     */
    async isFavorited(pianoId: number): Promise<boolean> {
        try {
            if (!localStorage.getItem('token')) return false;

            const response = await api.get(`/favorites/check/${pianoId}`);
            if (response.data.success) {
                return response.data.isFavorited;
            }
            return false;
        } catch (error: any) {
            // console.error('Error checking favorite:', error);
            return false;
        }
    }

    /**
     * Add piano to favorites
     */
    async addFavorite(pianoId: number): Promise<void> {
        try {
            await api.post(`/favorites/${pianoId}`);
        } catch (error: any) {
            console.error('Error adding favorite:', error);
            throw new Error(error.response?.data?.message || 'Không thể thêm yêu thích');
        }
    }

    /**
     * Remove piano from favorites
     */
    async removeFavorite(pianoId: number): Promise<void> {
        try {
            await api.delete(`/favorites/${pianoId}`);
        } catch (error: any) {
            console.error('Error removing favorite:', error);
            throw new Error(error.response?.data?.message || 'Không thể xóa yêu thích');
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
            const response = await api.get(`/favorites/count/${pianoId}`);
            if (response.data.success) {
                return response.data.count;
            }
            return 0;
        } catch (error: any) {
            console.error('Error getting favorite count:', error);
            return 0;
        }
    }
}

export default new FavoriteService();
