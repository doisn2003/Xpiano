import api from './api';

export interface Piano {
    id: number;
    name: string;
    image_url: string;
    category: string;
    price_per_day: number;
    price?: number; // Giá bán (nullable - nếu chỉ cho thuê)
    rating: number;
    reviews_count: number;
    description: string;
    features: string[];
    created_at?: string;
}

class PianoService {
    /**
     * Get all pianos with optional filters
     */
    async getAll(filters?: {
        category?: string;
        minRating?: number;
        maxPrice?: number;
    }): Promise<Piano[]> {
        try {
            const params: any = {};
            if (filters?.category && filters.category !== 'Tất cả') params.category = filters.category;
            if (filters?.minRating) params.minRating = filters.minRating;
            if (filters?.maxPrice) params.maxPrice = filters.maxPrice;

            const response = await api.get('/pianos', { params });

            if (response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (error: any) {
            console.error('Piano service error:', error);
            throw error;
        }
    }

    /**
     * Get piano by ID
     */
    async getById(id: number): Promise<Piano> {
        try {
            const response = await api.get(`/pianos/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error('Not found');
        } catch (error: any) {
            console.error('Piano service error:', error);
            throw error;
        }
    }

    /**
     * Create new piano (Admin only)
     */
    async create(piano: Omit<Piano, 'id' | 'created_at'>): Promise<Piano> {
        try {
            const response = await api.post('/pianos', piano);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error('Failed to create');
        } catch (error: any) {
            console.error('Piano service error:', error);
            throw error;
        }
    }

    /**
     * Update piano (Admin only)
     */
    async update(id: number, updates: Partial<Piano>): Promise<Piano> {
        try {
            const response = await api.put(`/pianos/${id}`, updates);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error('Failed to update');
        } catch (error: any) {
            console.error('Piano service error:', error);
            throw error;
        }
    }

    /**
     * Delete piano (Admin only)
     */
    async delete(id: number): Promise<void> {
        try {
            await api.delete(`/pianos/${id}`);
        } catch (error: any) {
            console.error('Piano service error:', error);
            throw error;
        }
    }

    /**
     * Get piano statistics
     */
    async getStats(): Promise<{
        total_pianos: number;
        total_categories: number;
        avg_price: number;
        avg_rating: number;
    }> {
        try {
            const response = await api.get('/pianos/stats');
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error('Failed to get stats');
        } catch (error: any) {
            console.error('Piano service error:', error);
            throw error;
        }
    }
}

export default new PianoService();
