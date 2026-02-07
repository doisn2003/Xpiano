import api from './api';

export interface Piano {
    id: number;
    name: string;
    image_url: string;
    category: string;
    price_per_hour: number;
    rating: number;
    reviews_count: number;
    description: string;
    features: string[];
    created_at?: string;
}

class PianoService {
    async getAll(filters?: {
        category?: string;
        minRating?: number;
        maxPrice?: number;
    }): Promise<Piano[]> {
        const params = new URLSearchParams();
        if (filters?.category && filters.category !== 'Tất cả') {
            params.append('category', filters.category);
        }
        if (filters?.minRating) {
            params.append('minRating', filters.minRating.toString());
        }
        if (filters?.maxPrice) {
            params.append('maxPrice', filters.maxPrice.toString());
        }

        const response = await api.get(`/pianos?${params.toString()}`);
        return response.data.data;
    }

    async getById(id: number): Promise<Piano> {
        const response = await api.get(`/pianos/${id}`);
        return response.data.data;
    }

    async getStats(): Promise<{
        total_pianos: number;
        total_categories: number;
        avg_price: number;
        avg_rating: number;
    }> {
        const response = await api.get('/pianos/stats');
        return response.data.data;
    }
}

export default new PianoService();
