import React, { useState, useEffect, useCallback } from 'react';
import walletService, { WithdrawalRequest } from '../../lib/walletService';
import {
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    RefreshCw,
    User as UserIcon,
    DollarSign,
    Building2,
    AlertTriangle,
    CreditCard,
    Info
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
// Confirm Dialog
// ============================
interface ConfirmDialogProps {
    message: string;
    subMessage?: string;
    confirmLabel: string;
    confirmStyle: React.CSSProperties;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    message, subMessage, confirmLabel, confirmStyle, onConfirm, onCancel, isLoading
}) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: 20
    }}>
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(240,192,88,0.2)', borderRadius: 20,
            padding: 32, width: '100%', maxWidth: 380,
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
        }}>
            <Info style={{ width: 40, height: 40, color: '#F0C058', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#E2E8F0', fontSize: 17, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>{message}</p>
            {subMessage && <p style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', margin: '0 0 24px' }}>{subMessage}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    style={{
                        flex: 1, padding: '10px', borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                        color: '#94A3B8', cursor: 'pointer', fontWeight: 600, fontSize: 14
                    }}
                >
                    Hủy
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...confirmStyle }}
                >
                    {isLoading && <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />}
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
);

// ============================
// Main Component: AdminWithdrawals
// ============================
const AdminWithdrawals: React.FC = () => {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionState, setActionState] = useState<{
        requestId: string | null;
        action: 'approve' | 'reject' | null;
        isProcessing: boolean;
    }>({ requestId: null, action: null, isProcessing: false });
    const [successMsg, setSuccessMsg] = useState('');

    const loadRequests = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const res = await walletService.getAdminWithdrawalRequests();
        setIsLoading(false);
        if (res.success && res.data) {
            setRequests(res.data.requests);
        } else {
            setError(res.message || 'Không thể tải danh sách yêu cầu');
        }
    }, []);

    useEffect(() => { loadRequests(); }, [loadRequests]);

    const handleAction = (requestId: string, action: 'approve' | 'reject') => {
        setActionState({ requestId, action, isProcessing: false });
    };

    const confirmAction = async () => {
        if (!actionState.requestId || !actionState.action) return;

        setActionState(prev => ({ ...prev, isProcessing: true }));
        const res = await walletService.processWithdrawalRequest(actionState.requestId, actionState.action);
        setActionState({ requestId: null, action: null, isProcessing: false });

        if (res.success) {
            const msg = actionState.action === 'approve'
                ? '✅ Đã xác nhận chuyển tiền thành công!'
                : '❌ Đã từ chối yêu cầu rút tiền!';
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(''), 4000);
            loadRequests(); // Reload list
        } else {
            setError(res.message || 'Lỗi khi xử lý yêu cầu');
        }
    };

    const cancelAction = () => {
        setActionState({ requestId: null, action: null, isProcessing: false });
    };

    // Tìm request đang được confirm
    const pendingConfirmRequest = actionState.requestId
        ? requests.find(r => r.id === actionState.requestId)
        : null;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ color: '#F0C058', fontSize: 26, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ShieldCheck style={{ width: 28, height: 28 }} />
                        Quản lý Rút tiền
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
                        Duyệt hoặc từ chối các yêu cầu rút tiền đang chờ xử lý
                    </p>
                </div>
                <button
                    onClick={loadRequests}
                    title="Làm mới"
                    style={{ background: 'rgba(240,192,88,0.1)', border: '1px solid rgba(240,192,88,0.2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#F0C058' }}
                >
                    <RefreshCw style={{ width: 16, height: 16 }} />
                </button>
            </div>

            {/* Success Toast */}
            {successMsg && (
                <div style={{
                    padding: '12px 20px', borderRadius: 12, marginBottom: 20,
                    background: successMsg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${successMsg.startsWith('✅') ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                    color: successMsg.startsWith('✅') ? '#10B981' : '#EF4444',
                    fontWeight: 600, fontSize: 14
                }}>
                    {successMsg}
                </div>
            )}

            {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                    <Loader2 style={{ width: 36, height: 36, color: '#F0C058', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <AlertTriangle style={{ width: 40, height: 40, color: '#EF4444', margin: '0 auto 12px' }} />
                    <p style={{ color: '#EF4444', marginBottom: 12 }}>{error}</p>
                    <button onClick={loadRequests} style={{ padding: '8px 20px', background: '#F0C058', color: '#1a1a1a', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                        Thử lại
                    </button>
                </div>
            ) : requests.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'rgba(26,26,46,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 18
                }}>
                    <Clock style={{ width: 48, height: 48, color: '#475569', margin: '0 auto 16px' }} />
                    <p style={{ color: '#94A3B8', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>Không có yêu cầu nào</p>
                    <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Tất cả yêu cầu rút tiền đã được xử lý</p>
                </div>
            ) : (
                <>
                    {/* Stats Bar */}
                    <div style={{
                        display: 'flex', gap: 16, marginBottom: 20, padding: '16px 20px',
                        background: 'rgba(26,26,46,0.6)', border: '1px solid rgba(240,192,88,0.15)',
                        borderRadius: 14
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock style={{ width: 16, height: 16, color: '#F59E0B' }} />
                            <span style={{ color: '#94A3B8', fontSize: 13 }}>
                                <strong style={{ color: '#F59E0B', fontSize: 18 }}>{requests.length}</strong>{' '}
                                yêu cầu đang chờ
                            </span>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <DollarSign style={{ width: 16, height: 16, color: '#10B981' }} />
                            <span style={{ color: '#94A3B8', fontSize: 13 }}>
                                Tổng: <strong style={{ color: '#10B981' }}>
                                    {formatCurrency(requests.reduce((sum, r) => sum + r.amount, 0))}
                                </strong>
                            </span>
                        </div>
                    </div>

                    {/* Requests Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {requests.map(req => (
                            <div key={req.id} style={{
                                background: 'rgba(26,26,46,0.8)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 16, padding: 20,
                                transition: 'border-color 0.2s'
                            }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
                                    {/* User Info */}
                                    <div style={{ flex: '1 1 160px' }}>
                                        <p style={{ color: '#64748B', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <UserIcon style={{ width: 12, height: 12 }} /> Người dùng
                                        </p>
                                        <p style={{ color: '#E2E8F0', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{req.full_name || 'N/A'}</p>
                                        <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 2px' }}>{req.email}</p>
                                        <span style={{
                                            display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                                            background: 'rgba(240,192,88,0.1)', color: '#F0C058',
                                            fontSize: 11, fontWeight: 600
                                        }}>{req.user_role || 'user'}</span>
                                    </div>

                                    {/* Amount */}
                                    <div style={{ flex: '1 1 140px' }}>
                                        <p style={{ color: '#64748B', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <DollarSign style={{ width: 12, height: 12 }} /> Số tiền
                                        </p>
                                        <p style={{ color: '#EF4444', fontWeight: 800, fontSize: 20, margin: 0 }}>
                                            {formatCurrency(req.amount)}
                                        </p>
                                        <p style={{ color: '#475569', fontSize: 11, margin: '4px 0 0' }}>
                                            {formatDate(req.created_at)}
                                        </p>
                                    </div>

                                    {/* Bank Info */}
                                    <div style={{ flex: '1 1 200px' }}>
                                        <p style={{ color: '#64748B', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Building2 style={{ width: 12, height: 12 }} /> Thông tin NH
                                        </p>
                                        <p style={{ color: '#E2E8F0', fontWeight: 600, fontSize: 13, margin: '0 0 2px' }}>{req.bank_info?.bank_name}</p>
                                        <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 2px', fontFamily: 'monospace', letterSpacing: 1 }}>
                                            {req.bank_info?.account_number}
                                        </p>
                                        <p style={{ color: '#CBD5E1', fontSize: 12, margin: 0 }}>{req.bank_info?.account_name}</p>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', flex: '0 0 auto' }}>
                                        <button
                                            onClick={() => handleAction(req.id, 'approve')}
                                            style={{
                                                padding: '9px 20px', borderRadius: 10, border: 'none',
                                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                                color: '#fff', fontWeight: 700, fontSize: 13,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <CheckCircle2 style={{ width: 15, height: 15 }} />
                                            Xác nhận đã chuyển
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'reject')}
                                            style={{
                                                padding: '9px 20px', borderRadius: 10,
                                                border: '1px solid rgba(239,68,68,0.4)',
                                                background: 'rgba(239,68,68,0.1)',
                                                color: '#EF4444', fontWeight: 700, fontSize: 13,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <XCircle style={{ width: 15, height: 15 }} />
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Confirm Dialog */}
            {actionState.requestId && pendingConfirmRequest && (
                <ConfirmDialog
                    message={actionState.action === 'approve'
                        ? 'Xác nhận đã chuyển tiền?'
                        : 'Từ chối yêu cầu rút tiền?'}
                    subMessage={actionState.action === 'approve'
                        ? `Bạn xác nhận đã chuyển ${formatCurrency(pendingConfirmRequest.amount)} đến tài khoản ${pendingConfirmRequest.bank_info?.bank_name} – ${pendingConfirmRequest.bank_info?.account_number}?`
                        : `Tiền sẽ được hoàn lại vào ví khả dụng của ${pendingConfirmRequest.full_name || 'user'}.`}
                    confirmLabel={actionState.action === 'approve' ? 'Đã chuyển tiền' : 'Từ chối ngay'}
                    confirmStyle={{
                        background: actionState.action === 'approve'
                            ? 'linear-gradient(135deg, #10B981, #059669)'
                            : 'linear-gradient(135deg, #EF4444, #DC2626)',
                        color: '#fff'
                    }}
                    onConfirm={confirmAction}
                    onCancel={cancelAction}
                    isLoading={actionState.isProcessing}
                />
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AdminWithdrawals;
