import React from 'react';
import AdminWithdrawals from '../components/Wallet/AdminWithdrawals';

/**
 * Trang quản lý yêu cầu rút tiền dành cho Admin
 * Route: /admin/withdrawals  (tích hợp vào admin dashboard của bạn)
 */
const AdminWithdrawalsPage: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #0d0d1a, #111827)',
        }}>
            <AdminWithdrawals />
        </div>
    );
};

export default AdminWithdrawalsPage;
