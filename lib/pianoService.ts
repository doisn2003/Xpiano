import { supabase } from './supabase';

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
    /**
     * Get all pianos with optional filters
     */
    async getAll(filters?: {
        category?: string;
        minRating?: number;
        maxPrice?: number;
    }): Promise<Piano[]> {
        try {
            let query = supabase
                .from('pianos')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters?.category && filters.category !== 'Tất cả') {
                query = query.eq('category', filters.category);
            }

            if (filters?.minRating) {
                query = query.gte('rating', filters.minRating);
            }

            if (filters?.maxPrice) {
                query = query.lte('price_per_hour', filters.maxPrice);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching pianos:', error);
                console.error('Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw new Error(`Không thể tải danh sách piano: ${error.message}`);
            }

            return data || [];
        } catch (error: any) {
            console.error('Piano service error:', error);
            console.error('Full error:', JSON.stringify(error, null, 2));
            throw error;
        }
    }

    /**
     * Get piano by ID
     */
    async getById(id: number): Promise<Piano> {
        try {
            const { data, error } = await supabase
                .from('pianos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching piano:', error);
                throw new Error('Không tìm thấy piano');
            }

            return data;
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
            const { data, error } = await supabase
                .from('pianos')
                .insert(piano)
                .select()
                .single();

            if (error) {
                console.error('Error creating piano:', error);
                throw new Error('Không thể tạo piano');
            }

            return data;
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
            const { data, error } = await supabase
                .from('pianos')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating piano:', error);
                throw new Error('Không thể cập nhật piano');
            }

            return data;
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
            const { error } = await supabase
                .from('pianos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting piano:', error);
                throw new Error('Không thể xóa piano');
            }
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
            // Get all pianos for stats calculation
            const { data: pianos, error } = await supabase
                .from('pianos')
                .select('category, price_per_hour, rating');

            if (error) {
                console.error('Error fetching stats:', error);
                throw new Error('Không thể tải thống kê');
            }

            const totalPianos = pianos?.length || 0;
            const categories = new Set(pianos?.map(p => p.category)).size;
            const avgPrice = pianos?.length
                ? pianos.reduce((sum, p) => sum + p.price_per_hour, 0) / pianos.length
                : 0;
            const avgRating = pianos?.length
                ? pianos.reduce((sum, p) => sum + p.rating, 0) / pianos.length
                : 0;

            return {
                total_pianos: totalPianos,
                total_categories: categories,
                avg_price: Math.round(avgPrice),
                avg_rating: Math.round(avgRating * 10) / 10,
            };
        } catch (error: any) {
            console.error('Piano service error:', error);
            throw error;
        }
    }

    /**
     * Subscribe to real-time piano changes (Bonus feature!)
     */
    subscribeToChanges(callback: (payload: any) => void) {
        return supabase
            .channel('pianos-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'pianos' },
                callback
            )
            .subscribe();
    }
}

export default new PianoService();
