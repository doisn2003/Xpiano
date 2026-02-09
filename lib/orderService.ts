import api from './api';

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
     * Helper: Calculate rental price
     */
    calculateRentalPrice(pricePerHour: number, days: number): number {
        const basePrice = pricePerHour * 8 * days;
        if (days >= 8) return Math.round(basePrice * 0.85); // 15% discount
        if (days >= 3) return Math.round(basePrice * 0.90); // 10% discount
        return basePrice;
    }

    /**
     * Helper: Calculate buy price
     */
    calculateBuyPrice(pricePerHour: number): number {
        return pricePerHour * 1000;
    }

    /**
     * Create new order
     */
    async createOrder(orderData: CreateOrderData): Promise<Order> {
        try {
            const response = await api.post('/orders', orderData);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Đặt hàng thất bại');
        } catch (error: any) {
            console.error('Error creating order:', error);
            throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
        }
    }

    /**
     * Get my orders
     */
    async getMyOrders(): Promise<OrderWithDetails[]> {
        try {
            // If not authenticated, return empty or handle error
            if (!localStorage.getItem('token')) return [];

            const response = await api.get('/orders/my-orders');
            if (response.data.success) {
                return response.data.data;
            }
            return [];
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
            const response = await api.get('/orders');
            if (response.data.success) {
                return response.data.data;
            }
            return [];
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
            await api.put(`/orders/${orderId}/status`, {
                status: 'approved',
                notes
            });
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
            await api.put(`/orders/${orderId}/status`, {
                status: 'rejected',
                notes: reason
            });
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
            await api.post(`/orders/${orderId}/cancel`);
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
            if (!localStorage.getItem('token')) return [];

            const response = await api.get('/orders/active-rentals');
            if (response.data.success) {
                return response.data.data;
            }
            return [];
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
            const response = await api.get('/orders/stats');
            if (response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error: any) {
            console.error('Error fetching order stats:', error);
            throw error;
        }
    }
}

export default new OrderService();
