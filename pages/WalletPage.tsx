import React from 'react';
import MyWalletDashboard from '../components/Wallet/MyWalletDashboard';

/**
 * Trang Ví điện tử dành cho User / Teacher
 * Route: /wallet
 */
const WalletPage: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #0d0d1a, #111827)',
        }}>
            <MyWalletDashboard />
        </div>
    );
};

export default WalletPage;
