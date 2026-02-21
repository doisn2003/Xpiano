import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, Copy, CheckCheck, Users, Gift, AlertCircle } from 'lucide-react';
import { GoldButton } from '../GoldButton';
import api from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AffiliateInfo {
    id: string;
    referral_code: string;
    commission_rate: number;
    commission_rate_percent: string;
    status: string;
    created_at: string;
}

interface AffiliateStats {
    pending_count: number;
    pending_total: number;
    approved_count: number;
    approved_total: number;
    cancelled_count: number;
    cancelled_total: number;
    lifetime_earned: number;
}

interface Commission {
    id: string;
    amount: number;
    reference_type: string;
    reference_id: string;
    status: 'pending' | 'approved' | 'cancelled';
    note: string | null;
    created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Chờ duyệt', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
    approved: { label: 'Đã thanh toán', color: '#14532D', bg: '#DCFCE7', border: '#86EFAC' },
    cancelled: { label: 'Đã hủy', color: '#7F1D1D', bg: '#FEE2E2', border: '#FCA5A5' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP.pending;
    return (
        <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`
        }}>
            {s.label}
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AffiliateDashboard: React.FC = () => {
    const [affiliate, setAffiliate] = useState<AffiliateInfo | null>(null);
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);
    const [notAffiliate, setNotAffiliate] = useState(false);

    const loadAffiliateData = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/affiliate/me');
            if (res.data?.success) {
                setAffiliate(res.data.data.affiliate);
                setStats(res.data.data.stats);
                setCommissions(res.data.data.commissions);
                setNotAffiliate(false);
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                setNotAffiliate(true);
            } else {
                setError('Không thể tải dữ liệu affiliate');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAffiliateData(); }, []);

    const handleRegister = async () => {
        try {
            setRegistering(true);
            setError('');
            const res = await api.post('/affiliate/register');
            if (res.data?.success) {
                setSuccess(res.data.message);
                await loadAffiliateData();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setRegistering(false);
        }
    };

    const handleCopyCode = async () => {
        if (!affiliate?.referral_code) return;
        await navigator.clipboard.writeText(affiliate.referral_code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                <p style={{ color: '#6B7280', marginTop: 12, fontSize: 14 }}>Đang tải thông tin Affiliate...</p>
            </div>
        );
    }

    // ── Not yet an affiliate ─────────────────────────────────────────────────
    if (notAffiliate) {
        return (
            <div style={{
                borderRadius: 20, padding: 40, textAlign: 'center',
                background: '#FFFBEB',
                border: '1px solid #FCD34D'
            }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#78350F', marginBottom: 12 }}>
                    Chương trình Đối tác Affiliate
                </h3>
                <p style={{ color: '#44403C', fontSize: 14, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
                    Chia sẻ link sản phẩm đàn piano. Khi khách hàng mua/thuê qua link của bạn,
                    bạn nhận <strong style={{ color: '#92400E' }}>10% hoa hồng</strong> tự động vào ví.
                </p>

                {/* Benefits */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', marginBottom: 28 }}>
                    {[
                        { icon: '💰', text: 'Hoa hồng 10%/đơn' },
                        { icon: '⚡', text: 'Tính tự động tức thì' },
                        { icon: '🏦', text: 'Rút về ví dễ dàng' },
                    ].map((b, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#292524', fontSize: 14, fontWeight: 500 }}>
                            <span>{b.icon}</span> {b.text}
                        </div>
                    ))}
                </div>

                {error && (
                    <div style={{ color: '#7F1D1D', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ color: '#14532D', background: '#DCFCE7', border: '1px solid #86EFAC', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                        {success}
                    </div>
                )}

                <GoldButton
                    id="affiliate-register-btn"
                    onClick={handleRegister}
                    disabled={registering}
                    className="px-8 py-3 rounded-xl font-bold text-base disabled:opacity-50"
                >
                    {registering ? 'Đang đăng ký...' : '🚀 Đăng ký làm Đối tác ngay'}
                </GoldButton>
                <p style={{ color: '#78716C', fontSize: 12, marginTop: 12 }}>Miễn phí · Không ràng buộc · Kích hoạt ngay</p>
            </div>
        );
    }

    if (!affiliate || !stats) return null;

    // ── Active Dashboard ─────────────────────────────────────────────────────
    return (
        <div>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={20} style={{ color: '#C89B30' }} />
                        Bảng điều khiển Affiliate
                    </h3>
                    <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
                        Thành viên từ {new Date(affiliate.created_at).toLocaleDateString('vi-VN')}
                    </p>
                </div>

                {/* Referral code chip */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#FEF9C3', border: '1px solid #FCD34D',
                    borderRadius: 12, padding: '8px 14px'
                }}>
                    <span style={{ color: '#6B7280', fontSize: 12 }}>Mã của bạn:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#78350F', fontSize: 15, letterSpacing: 1 }}>
                        {affiliate.referral_code}
                    </span>
                    <button
                        onClick={handleCopyCode}
                        title="Copy mã"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: codeCopied ? '#14532D' : '#6B7280', display: 'flex' }}
                    >
                        {codeCopied ? <CheckCheck size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
                {[
                    {
                        icon: <Clock size={20} />,
                        label: 'Chờ duyệt',
                        value: fmt(stats.pending_total),
                        subValue: `${stats.pending_count} khoản`,
                        iconColor: '#D97706', bg: '#FFFBEB', border: '#FCD34D', valueColor: '#92400E'
                    },
                    {
                        icon: <CheckCircle size={20} />,
                        label: 'Đã nhận',
                        value: fmt(stats.approved_total),
                        subValue: `${stats.approved_count} lần`,
                        iconColor: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', valueColor: '#14532D'
                    },
                    {
                        icon: <TrendingUp size={20} />,
                        label: 'Tổng thu nhập',
                        value: fmt(stats.lifetime_earned),
                        subValue: `Tỷ lệ: ${affiliate.commission_rate_percent}`,
                        iconColor: '#C89B30', bg: '#FEFCE8', border: '#FCD34D', valueColor: '#78350F'
                    },
                    {
                        icon: <Gift size={20} />,
                        label: 'Đã hủy',
                        value: fmt(stats.cancelled_total),
                        subValue: `${stats.cancelled_count} khoản`,
                        iconColor: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB', valueColor: '#374151'
                    },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        borderRadius: 16,
                        padding: '16px 18px'
                    }}>
                        <div style={{ color: s.iconColor, marginBottom: 8 }}>{s.icon}</div>
                        <p style={{ color: '#6B7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {s.label}
                        </p>
                        <p style={{ color: s.valueColor, fontSize: 17, fontWeight: 700, margin: '4px 0 2px' }}>
                            {s.value}
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: 11 }}>{s.subValue}</p>
                    </div>
                ))}
            </div>

            {/* Commission History Table */}
            <div>
                <h4 style={{ fontWeight: 700, color: '#111827', marginBottom: 12, fontSize: 15 }}>
                    Lịch sử hoa hồng (20 gần nhất)
                </h4>

                {commissions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#6B7280' }}>
                        <AlertCircle size={36} style={{ margin: '0 auto 10px', color: '#D1D5DB' }} />
                        <p style={{ color: '#6B7280' }}>Chưa có hoa hồng nào. Hãy chia sẻ link sản phẩm để bắt đầu!</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                    {['Thời gian', 'Đơn hàng #', 'Loại', 'Số tiền', 'Trạng thái', 'Ghi chú'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#374151', fontWeight: 700, fontSize: 12 }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.map((c, idx) => (
                                    <tr
                                        key={c.id}
                                        style={{
                                            borderBottom: '1px solid #F3F4F6',
                                            background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                                        }}
                                    >
                                        <td style={{ padding: '12px 14px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                                            {new Date(c.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#78350F', fontFamily: 'monospace', fontWeight: 700 }}>
                                            #{c.reference_id}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#374151' }}>
                                            {c.reference_type === 'order_piano' ? '🎹 Đàn piano' : c.reference_type}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#14532D', fontWeight: 700 }}>
                                            {fmt(c.amount)}
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 11, maxWidth: 200 }}>
                                            {c.note || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AffiliateDashboard;
