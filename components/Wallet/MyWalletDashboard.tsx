import React, { useState, useEffect, useCallback } from 'react';
import walletService, { Wallet, Transaction, WithdrawalRequest, BankInfo } from '../../lib/walletService';
import {
    Wallet as WalletIcon,
    ArrowDownCircle,
    ArrowUpCircle,
    TrendingUp,
    Lock,
    X,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    Building2,
    CreditCard,
    User as UserIcon,
    AlertTriangle
} from 'lucide-react';

// ============================
// Formatters
// ============================
const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateStr));

// ============================
// Status Badge
// ============================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
        pending: { label: 'Đang chờ', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: <Clock style={{ width: 12, height: 12 }} /> },
        approved: { label: 'Đã duyệt', color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: <CheckCircle2 style={{ width: 12, height: 12 }} /> },
        rejected: { label: 'Từ chối', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: <XCircle style={{ width: 12, height: 12 }} /> }
    };
    const c = config[status] || config.pending;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 9999,
            fontSize: 12, fontWeight: 600,
            color: c.color, background: c.bg, border: `1px solid ${c.color}33`
        }}>
            {c.icon} {c.label}
        </span>
    );
};

// ============================
// Withdraw Modal
// ============================
interface WithdrawModalProps {
    onClose: () => void;
    onSuccess: () => void;
    availableBalance: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onSuccess, availableBalance }) => {
    const [amount, setAmount] = useState('');
    const [bankInfo, setBankInfo] = useState<BankInfo>({ bank_name: '', account_number: '', account_name: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ''));

        if (!numericAmount || numericAmount <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ');
            return;
        }
        if (numericAmount > availableBalance) {
            setError(`Số tiền vượt quá số dư khả dụng (${formatCurrency(availableBalance)})`);
            return;
        }
        if (!bankInfo.bank_name.trim() || !bankInfo.account_number.trim() || !bankInfo.account_name.trim()) {
            setError('Vui lòng điền đầy đủ thông tin ngân hàng');
            return;
        }

        setIsLoading(true);
        const res = await walletService.requestWithdrawal(numericAmount, bankInfo);
        setIsLoading(false);

        if (res.success) {
            setSuccess(true);
            setTimeout(() => { onClose(); onSuccess(); }, 2000);
        } else {
            setError(res.message || 'Lỗi khi gửi yêu cầu');
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: 10,
        border: '1px solid rgba(240,192,88,0.3)', background: 'rgba(255,255,255,0.05)',
        color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: 20
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(240,192,88,0.2)', borderRadius: 20,
                padding: 32, width: '100%', maxWidth: 440,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h2 style={{ color: '#F0C058', fontSize: 20, fontWeight: 700, margin: 0 }}>Rút tiền</h2>
                        <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0' }}>
                            Số dư: <strong style={{ color: '#10B981' }}>{formatCurrency(availableBalance)}</strong>
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
                        <X style={{ width: 22, height: 22 }} />
                    </button>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle2 style={{ width: 48, height: 48, color: '#10B981', margin: '0 auto 12px' }} />
                        <p style={{ color: '#10B981', fontSize: 16, fontWeight: 600 }}>Yêu cầu đã được gửi!</p>
                        <p style={{ color: '#94A3B8', fontSize: 13 }}>Admin sẽ xử lý trong 1-3 ngày làm việc</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Amount */}
                        <div>
                            <label style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                                Số tiền muốn rút (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="50,000"
                                min="50000"
                                max={availableBalance}
                                step="1000"
                                style={inputStyle}
                                required
                            />
                            <p style={{ color: '#64748B', fontSize: 11, margin: '4px 0 0' }}>Tối thiểu 50,000 VNĐ</p>
                        </div>

                        {/* Bank info section */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                            <p style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Building2 style={{ width: 14, height: 14, color: '#F0C058' }} />
                                Thông tin ngân hàng
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <input
                                    placeholder="Tên ngân hàng (VD: Vietcombank, Techcombank)"
                                    value={bankInfo.bank_name}
                                    onChange={e => setBankInfo(p => ({ ...p, bank_name: e.target.value }))}
                                    style={inputStyle}
                                    required
                                />
                                <input
                                    placeholder="Số tài khoản"
                                    value={bankInfo.account_number}
                                    onChange={e => setBankInfo(p => ({ ...p, account_number: e.target.value }))}
                                    style={inputStyle}
                                    required
                                />
                                <input
                                    placeholder="Tên chủ tài khoản (VIẾT HOA)"
                                    value={bankInfo.account_name}
                                    onChange={e => setBankInfo(p => ({ ...p, account_name: e.target.value.toUpperCase() }))}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', borderRadius: 10,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)'
                            }}>
                                <AlertTriangle style={{ width: 16, height: 16, color: '#EF4444', flexShrink: 0 }} />
                                <p style={{ color: '#FCA5A5', fontSize: 13, margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '12px', borderRadius: 12, border: 'none',
                                background: isLoading ? '#64748B' : 'linear-gradient(135deg, #F0C058, #E8A020)',
                                color: '#1a1a1a', fontWeight: 700, fontSize: 15,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.2s'
                            }}
                        >
                            {isLoading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : null}
                            {isLoading ? 'Đang gửi...' : 'Xác nhận rút tiền'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

// ============================
// Main Component: MyWalletDashboard
// ============================
const MyWalletDashboard: React.FC = () => {
    const [walletData, setWalletData] = useState<{ wallet: Wallet; transactions: Transaction[]; withdrawal_requests: WithdrawalRequest[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const loadWallet = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const res = await walletService.getMyWallet();
        setIsLoading(false);
        if (res.success && res.data) {
            setWalletData(res.data);
        } else {
            setError(res.message || 'Không thể tải thông tin ví');
        }
    }, []);

    useEffect(() => { loadWallet(); }, [loadWallet]);

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 style={{ width: 36, height: 36, color: '#F0C058', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <AlertTriangle style={{ width: 40, height: 40, color: '#EF4444', margin: '0 auto 12px' }} />
            <p style={{ color: '#EF4444', marginBottom: 12 }}>{error}</p>
            <button onClick={loadWallet} style={{ padding: '8px 20px', background: '#F0C058', color: '#1a1a1a', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Thử lại
            </button>
        </div>
    );

    const { wallet, transactions, withdrawal_requests } = walletData!;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ color: '#F0C058', fontSize: 26, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <WalletIcon style={{ width: 28, height: 28 }} />
                        Ví điện tử
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>Quản lý số dư và giao dịch của bạn</p>
                </div>
                <button
                    onClick={loadWallet}
                    title="Làm mới"
                    style={{ background: 'rgba(240,192,88,0.1)', border: '1px solid rgba(240,192,88,0.2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#F0C058' }}
                >
                    <RefreshCw style={{ width: 16, height: 16 }} />
                </button>
            </div>

            {/* Balance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
                {/* Available Balance Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2547 100%)',
                    border: '1px solid rgba(16,185,129,0.3)', borderRadius: 18, padding: '24px',
                    boxShadow: '0 8px 32px rgba(16,185,129,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#94A3B8', fontSize: 12, fontWeight: 500, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Số dư khả dụng
                            </p>
                            <p style={{ color: '#10B981', fontSize: 28, fontWeight: 800, margin: 0 }}>
                                {formatCurrency(wallet.available_balance)}
                            </p>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: 12, padding: 12 }}>
                            <TrendingUp style={{ width: 24, height: 24, color: '#10B981' }} />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={wallet.available_balance < 50000}
                        style={{
                            marginTop: 20, width: '100%', padding: '10px', border: 'none',
                            borderRadius: 10, cursor: wallet.available_balance < 50000 ? 'not-allowed' : 'pointer',
                            background: wallet.available_balance < 50000
                                ? 'rgba(100,116,139,0.3)'
                                : 'linear-gradient(135deg, #F0C058, #E8A020)',
                            color: wallet.available_balance < 50000 ? '#64748B' : '#1a1a1a',
                            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        <ArrowUpCircle style={{ width: 16, height: 16 }} />
                        Rút tiền
                    </button>
                </div>

                {/* Locked Balance Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #2d1b3e 0%, #1a0f2e 100%)',
                    border: '1px solid rgba(245,158,11,0.3)', borderRadius: 18, padding: '24px',
                    boxShadow: '0 8px 32px rgba(245,158,11,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#94A3B8', fontSize: 12, fontWeight: 500, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Đang xử lý (Tạm khóa)
                            </p>
                            <p style={{ color: '#F59E0B', fontSize: 28, fontWeight: 800, margin: 0 }}>
                                {formatCurrency(wallet.locked_balance)}
                            </p>
                        </div>
                        <div style={{ background: 'rgba(245,158,11,0.15)', borderRadius: 12, padding: 12 }}>
                            <Lock style={{ width: 24, height: 24, color: '#F59E0B' }} />
                        </div>
                    </div>
                    <p style={{ color: '#64748B', fontSize: 12, marginTop: 20 }}>
                        Tiền đang chờ admin duyệt rút. Sẽ được giải phóng hoặc hoàn lại.
                    </p>
                </div>
            </div>

            {/* Withdrawal Requests History */}
            {withdrawal_requests.length > 0 && (
                <div style={{
                    background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 18, padding: 24, marginBottom: 24
                }}>
                    <h3 style={{ color: '#E2E8F0', fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CreditCard style={{ width: 18, height: 18, color: '#F0C058' }} />
                        Yêu cầu rút tiền gần đây
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {withdrawal_requests.map(req => (
                            <div key={req.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                                borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <div>
                                    <p style={{ color: '#E2E8F0', fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>
                                        {formatCurrency(req.amount)}
                                    </p>
                                    <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>
                                        {req.bank_info?.bank_name} – {req.bank_info?.account_number}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <StatusBadge status={req.status} />
                                    <p style={{ color: '#475569', fontSize: 11, margin: '4px 0 0' }}>{formatDate(req.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div style={{
                background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18, padding: 24
            }}>
                <h3 style={{ color: '#E2E8F0', fontSize: 16, fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronRight style={{ width: 18, height: 18, color: '#F0C058' }} />
                    Lịch sử giao dịch
                </h3>

                {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                        <WalletIcon style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>Chưa có giao dịch nào</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {transactions.map((tx, idx) => (
                            <div key={tx.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 16px',
                                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                borderRadius: 10,
                                borderBottom: idx < transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: tx.type === 'IN' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
                                    }}>
                                        {tx.type === 'IN'
                                            ? <ArrowDownCircle style={{ width: 20, height: 20, color: '#10B981' }} />
                                            : <ArrowUpCircle style={{ width: 20, height: 20, color: '#EF4444' }} />
                                        }
                                    </div>
                                    <div>
                                        <p style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 500, margin: '0 0 2px' }}>
                                            {tx.note || (tx.reference_type ? tx.reference_type.replace(/_/g, ' ') : 'Giao dịch')}
                                        </p>
                                        <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>{formatDate(tx.created_at)}</p>
                                    </div>
                                </div>
                                <p style={{
                                    color: tx.type === 'IN' ? '#10B981' : '#EF4444',
                                    fontWeight: 700, fontSize: 15, margin: 0
                                }}>
                                    {tx.type === 'IN' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <WithdrawModal
                    onClose={() => setShowWithdrawModal(false)}
                    onSuccess={loadWallet}
                    availableBalance={wallet.available_balance}
                />
            )}

            {/* CSS keyframe for spin */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default MyWalletDashboard;
