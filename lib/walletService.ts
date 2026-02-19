import api from './api';

// ============================
// Types
// ============================

export interface Wallet {
    id: string;
    available_balance: number;
    locked_balance: number;
    total_balance: number;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    type: 'IN' | 'OUT';
    amount: number;
    reference_type: string | null;
    reference_id: string | null;
    note: string | null;
    created_at: string;
}

export interface WithdrawalRequest {
    id: string;
    user_id: string;
    amount: number;
    bank_info: {
        bank_name: string;
        account_number: string;
        account_name: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    note: string | null;
    created_at: string;
    updated_at: string;
    // Joined from profiles (for admin view)
    full_name?: string;
    email?: string;
    phone?: string;
    user_role?: string;
}

export interface WalletData {
    wallet: Wallet;
    transactions: Transaction[];
    withdrawal_requests: WithdrawalRequest[];
}

export interface BankInfo {
    bank_name: string;
    account_number: string;
    account_name: string;
}

// ============================
// Wallet API Service
// ============================

class WalletService {
    /**
     * Lấy thông tin ví và lịch sử giao dịch
     */
    async getMyWallet(): Promise<{ success: boolean; data?: WalletData; message?: string }> {
        try {
            const response = await api.get('/wallet/my-wallet');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy thông tin ví'
            };
        }
    }

    /**
     * Tạo yêu cầu rút tiền
     */
    async requestWithdrawal(amount: number, bank_info: BankInfo): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            const response = await api.post('/wallet/withdraw', { amount, bank_info });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo yêu cầu rút tiền'
            };
        }
    }

    /**
     * Admin: Lấy danh sách yêu cầu rút tiền đang pending
     */
    async getAdminWithdrawalRequests(): Promise<{ success: boolean; data?: { requests: WithdrawalRequest[]; total: number }; message?: string }> {
        try {
            const response = await api.get('/wallet/admin/requests');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách yêu cầu'
            };
        }
    }

    /**
     * Admin: Xử lý yêu cầu rút tiền (approve hoặc reject)
     */
    async processWithdrawalRequest(request_id: string, action: 'approve' | 'reject'): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            const response = await api.post('/wallet/admin/process-request', { request_id, action });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xử lý yêu cầu'
            };
        }
    }
}

export default new WalletService();
