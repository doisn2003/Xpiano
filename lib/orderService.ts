import { supabase } from './supabase';

export interface Order {
    id: number;
    user_id: string;
    piano_id: number;
    type: 'buy' | 'rent';
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    total_price: number;
    rental_start_date?: string;
    rental_end_date?: string;
    rental_days?: number;
    admin_notes?: string;
    approved_by?: string;
    approved_at?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderWithDetails extends Order {
    piano?: {
        id: number;
        name: string;
        image_url: string;
        category: string;
    };
    user?: {
        full_name: string;
        email: string;
    };
}

export interface CreateOrderData {
    piano_id: number;
    type: 'buy' | 'rent';
    rental_start_date?: string;
    rental_end_date?: string;
}

class OrderService {
    /**
     * Calculate rental price
     */
    calculateRentalPrice(pricePerHour: number, days: number): number {
        // Giá thuê = price_per_hour * 8 hours/day * days
        // Discount: 3-7 days: -10%, 8+ days: -15%
        const basePrice = pricePerHour * 8 * days;

        if (days >= 8) {
            return Math.round(basePrice * 0.85); // 15% discount
        } else if (days >= 3) {
            return Math.round(basePrice * 0.90); // 10% discount
        }

        return basePrice;
    }

    /**
     * Calculate buy price (assumption: ~1000x hourly rate)
     */
    calculateBuyPrice(pricePerHour: number): number {
        return pricePerHour * 1000;
    }

    /**
     * Create new order
     */
    async createOrder(orderData: CreateOrderData): Promise<Order> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Bạn cần đăng nhập để đặt hàng');

            // Get piano price
            const { data: piano, error: pianoError } = await supabase
                .from('pianos')
                .select('price_per_hour')
                .eq('id', orderData.piano_id)
                .single();

            if (pianoError) throw new Error('Không tìm thấy piano');

            let totalPrice: number;
            let rentalDays: number | undefined;

            if (orderData.type === 'rent') {
                if (!orderData.rental_start_date || !orderData.rental_end_date) {
                    throw new Error('Vui lòng chọn ngày thuê');
                }

                const startDate = new Date(orderData.rental_start_date);
                const endDate = new Date(orderData.rental_end_date);
                rentalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                if (rentalDays < 1) {
                    throw new Error('Thời gian thuê phải ít nhất 1 ngày');
                }

                totalPrice = this.calculateRentalPrice(piano.price_per_hour, rentalDays);
            } else {
                totalPrice = this.calculateBuyPrice(piano.price_per_hour);
            }

            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    piano_id: orderData.piano_id,
                    type: orderData.type,
                    total_price: totalPrice,
                    rental_start_date: orderData.rental_start_date || null,
                    rental_end_date: orderData.rental_end_date || null,
                    rental_days: rentalDays || null,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    /**
     * Get my orders
     */
    async getMyOrders(): Promise<OrderWithDetails[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          piano:pianos(id, name, image_url, category)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    /**
     * Get all orders (Admin only)
     */
    async getAllOrders(): Promise<OrderWithDetails[]> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          piano:pianos(id, name, image_url, category),
          user:profiles!orders_user_id_fkey(full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('Error fetching all orders:', error);
            throw error;
        }
    }

    /**
     * Approve order (Admin)
     */
    async approveOrder(orderId: number, notes?: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Unauthorized');

            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'approved',
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                    admin_notes: notes || null,
                })
                .eq('id', orderId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error approving order:', error);
            throw error;
        }
    }

    /**
     * Reject order (Admin)
     */
    async rejectOrder(orderId: number, reason?: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'rejected',
                    admin_notes: reason || null,
                })
                .eq('id', orderId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error rejecting order:', error);
            throw error;
        }
    }

    /**
     * Cancel order (User - only pending orders)
     */
    async cancelOrder(orderId: number): Promise<void> {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId)
                .eq('status', 'pending');

            if (error) throw error;
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    /**
     * Get active rentals (for current user)
     */
    async getMyActiveRentals() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('rentals')
                .select(`
          *,
          piano:pianos(id, name, image_url, category)
        `)
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('end_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('Error fetching active rentals:', error);
            return [];
        }
    }

    /**
     * Get order statistics (Admin)
     */
    async getOrderStats() {
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('type, status, total_price');

            if (error) throw error;

            const stats = {
                total: orders?.length || 0,
                pending: orders?.filter(o => o.status === 'pending').length || 0,
                approved: orders?.filter(o => o.status === 'approved').length || 0,
                rejected: orders?.filter(o => o.status === 'rejected').length || 0,
                totalRevenue: orders?.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.total_price, 0) || 0,
                buyOrders: orders?.filter(o => o.type === 'buy').length || 0,
                rentOrders: orders?.filter(o => o.type === 'rent').length || 0,
            };

            return stats;
        } catch (error: any) {
            console.error('Error fetching order stats:', error);
            throw error;
        }
    }
}

export default new OrderService();
