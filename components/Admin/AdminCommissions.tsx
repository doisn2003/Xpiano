import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, DollarSign } from 'lucide-react';
import { GoldButton } from '../GoldButton';
import api from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Commission {
    id: string;
    affiliate_id: string;
    amount: number;
    reference_type: string;
    reference_id: string;
    status: 'pending' | 'approved' | 'cancelled';
    note: string | null;
    approved_at: string | null;
    created_at: string;
    referral_code: string;
    commission_rate: number;
    affiliate_name: string | null;
    affiliate_email: string | null;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        pending: { label: 'Chờ duyệt', icon: <Clock size={12} />, color: '#D97706' },
        approved: { label: 'Đã duyệt', icon: <CheckCircle size={12} />, color: '#16A34A' },
        cancelled: { label: 'Đã hủy', icon: <XCircle size={12} />, color: '#DC2626' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55`
        }}>
            {s.icon} {s.label}
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminCommissions: React.FC = () => {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'cancelled' | 'all'>('pending');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadCommissions = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/affiliate/admin/commissions', {
                params: { status: statusFilter, page, limit: 20 }
            });
            if (res.data?.success) {
                setCommissions(res.data.data.commissions);
                setPagination(res.data.data.pagination);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải danh sách hoa hồng');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => { loadCommissions(); }, [loadCommissions]);

    const handleApprove = async (commissionId: string) => {
        if (!confirm('Duyệt hoa hồng này sẽ chuyển tiền từ ví Admin sang ví Affiliate. Xác nhận?')) return;
        try {
            setApprovingId(commissionId);
            setError('');
            const res = await api.post('/affiliate/admin/approve-commission', { commission_id: commissionId });
            if (res.data?.success) {
                setSuccess(`✅ Đã duyệt! Chuyển ${fmt(res.data.data.amount)} thành công.`);
                setTimeout(() => setSuccess(''), 4000);
                await loadCommissions();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Duyệt hoa hồng thất bại');
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <div>
            {/* Header + Filter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DollarSign size={22} style={{ color: '#C89B30' }} />
                        Quản lý Hoa hồng Affiliate
                    </h2>
                    {pagination && (
                        <p style={{ color: '#374151', fontSize: 13, marginTop: 2 }}>
                            {pagination.total} khoản hoa hồng
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Status filter pills */}
                    <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.06)', padding: '4px 6px', borderRadius: 12 }}>
                        {(['pending', 'approved', 'cancelled', 'all'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setPage(1); }}
                                style={{
                                    padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                    background: statusFilter === s ? 'rgba(200,155,48,0.15)' : 'transparent',
                                    color: statusFilter === s ? '#92700A' : '#374151',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {s === 'pending' ? 'Chờ duyệt' : s === 'approved' ? 'Đã duyệt' : s === 'cancelled' ? 'Đã hủy' : 'Tất cả'}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={loadCommissions}
                        title="Làm mới"
                        style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#374151', display: 'flex' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Alert messages */}
            {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 16px', borderRadius: 10, marginBottom: 14, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {success && (
                <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '10px 16px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>
                    {success}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                </div>
            ) : commissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
                    <AlertCircle size={36} style={{ margin: '0 auto 10px' }} />
                    <p>Không có hoa hồng nào ở trạng thái "{statusFilter}"</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                                {['Thời gian', 'Affiliate', 'Mã GT', 'Đơn hàng', 'Hoa hồng', 'Trạng thái', 'Hành động'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#374151', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.025)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '14px 14px', color: '#6B7280', whiteSpace: 'nowrap', fontSize: 12 }}>
                                        {new Date(c.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '14px 14px' }}>
                                        <p style={{ color: '#111827', fontWeight: 600 }}>{c.affiliate_name || 'N/A'}</p>
                                        <p style={{ color: '#6B7280', fontSize: 11 }}>{c.affiliate_email || ''}</p>
                                    </td>
                                    <td style={{ padding: '14px 14px', fontFamily: 'monospace', color: '#92700A', fontWeight: 700, fontSize: 12 }}>
                                        {c.referral_code}
                                    </td>
                                    <td style={{ padding: '14px 14px', color: '#374151', fontFamily: 'monospace' }}>
                                        #{c.reference_id}
                                        <br />
                                        <span style={{ fontSize: 11, color: '#6B7280' }}>
                                            {c.reference_type === 'order_piano' ? '🎹 Đàn piano' : c.reference_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 14px' }}>
                                        <p style={{ color: '#166534', fontWeight: 700 }}>{fmt(c.amount)}</p>
                                        <p style={{ color: '#6B7280', fontSize: 11 }}>
                                            Tỷ lệ: {(c.commission_rate * 100).toFixed(0)}%
                                        </p>
                                    </td>
                                    <td style={{ padding: '14px 14px' }}>
                                        <StatusBadge status={c.status} />
                                    </td>
                                    <td style={{ padding: '14px 14px' }}>
                                        {c.status === 'pending' ? (
                                            <GoldButton
                                                id={`approve-commission-${c.id}`}
                                                onClick={() => handleApprove(c.id)}
                                                disabled={approvingId === c.id}
                                                className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {approvingId === c.id ? (
                                                    <><RefreshCw size={12} className="animate-spin" /> Đang xử lý...</>
                                                ) : (
                                                    <><CheckCircle size={14} /> Duyệt trả tiền</>
                                                )}
                                            </GoldButton>
                                        ) : (
                                            <span style={{ color: '#6B7280', fontSize: 12 }}>
                                                {c.approved_at ? new Date(c.approved_at).toLocaleDateString('vi-VN') : '—'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: page === 1 ? '#D1D5DB' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                    >
                        ← Trước
                    </button>
                    <span style={{ color: '#374151', fontSize: 13 }}>
                        Trang {page} / {pagination.total_pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                        disabled={page === pagination.total_pages}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: page === pagination.total_pages ? '#D1D5DB' : '#374151', cursor: page === pagination.total_pages ? 'not-allowed' : 'pointer', fontSize: 13 }}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminCommissions;
