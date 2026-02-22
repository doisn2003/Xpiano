import api from './api';
import { getAffiliateRef } from '../hooks/useAffiliateTracking';

export type PaymentMethod = 'COD' | 'QR';

export interface Order {
    id: number;
    user_id: string;
    piano_id: number;
    type: 'buy' | 'rent';
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'payment_failed';
    total_price: number;
    rental_start_date?: string;
    rental_end_date?: string;
    rental_days?: number;
    admin_notes?: string;
    approved_by?: string;
    approved_at?: string;
    payment_method?: PaymentMethod;
    transaction_code?: string;
    payment_expired_at?: string;
    paid_at?: string;
    created_at: string;
    updated_at: string;
}

export interface BankInfo {
    bank_name: string;
    account_number: string;
    account_name: string;
    amount: number;
    description: string;
}

export interface OrderResponse extends Order {
    qr_url?: string | null;
    bank_info?: BankInfo | null;
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
    piano_id?: number;
    course_id?: string;
    type: 'buy' | 'rent' | 'course';
    rental_start_date?: string;
    rental_end_date?: string;
    payment_method?: PaymentMethod;
    // Affiliate tracking
    affiliate_ref?: string;
}

export interface OrderStatusResponse {
    id: number;
    status: string;
    payment_method: string;
    payment_expired_at: string;
    paid_at: string | null;
    transaction_code: string | null;
    is_expired: boolean;
}

class OrderService {
    /**
     * Helper: Calculate rental price (based on price per day)
     */
    calculateRentalPrice(pricePerDay: number, days: number): number {
        const basePrice = pricePerDay * days;
        if (days >= 8) return Math.round(basePrice * 0.85); // 15% discount
        if (days >= 3) return Math.round(basePrice * 0.90); // 10% discount
        return basePrice;
    }

    /**
     * Helper: Calculate buy price (use explicit price if available, otherwise calculate from pricePerDay)
     */
    calculateBuyPrice(price?: number, pricePerDay?: number): number {
        // If piano has explicit price, use it
        if (price && price > 0) {
            return price;
        }
        // Otherwise, calculate from pricePerDay
        if (pricePerDay) {
            return pricePerDay * 100;
        }
        return 0;
    }

    /**
     * Create new order
     */
    async createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
        try {
            // Đọc mã affiliate từ localStorage nếu còn hạn
            // Frontend không tính tiền, chỉ đính kèm ref_code để backend xử lý
            const affiliateRef = getAffiliateRef();
            const payload: CreateOrderData = {
                ...orderData,
                ...(affiliateRef ? { affiliate_ref: affiliateRef } : {})
            };

            if (affiliateRef) {
                console.log(`📎 Order sent with affiliate ref: ${affiliateRef}`);
            }

            const response = await api.post('/orders', payload);
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
     * Check order payment status (for polling)
     */
    async checkOrderStatus(orderId: number): Promise<OrderStatusResponse> {
        try {
            const response = await api.get(`/orders/${orderId}/status`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Không thể kiểm tra trạng thái');
        } catch (error: any) {
            console.error('Error checking order status:', error);
            // Include status code in error message for frontend detection
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || 'Lỗi kiểm tra trạng thái';
            throw new Error(statusCode ? `[${statusCode}] ${message}` : message);
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
            // Include status code in error message for frontend detection
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || 'Không thể hủy đơn hàng';
            throw new Error(statusCode ? `[${statusCode}] ${message}` : message);
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
