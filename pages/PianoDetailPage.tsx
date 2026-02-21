import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoldButton } from '../components/GoldButton';
import { Heart, ShoppingCart, Calendar, Star, ArrowLeft, Clock, AlertCircle, CreditCard, Share2, Copy, CheckCheck, Link } from 'lucide-react';
import pianoService, { Piano } from '../lib/pianoService';
import favoriteService from '../lib/favoriteService';
import orderService, { OrderResponse } from '../lib/orderService';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PaymentModal } from '../components/PaymentModal';
import api from '../lib/api';

export const PianoDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [piano, setPiano] = useState<Piano | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Buy/Rent Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalType, setModalType] = useState<'buy' | 'rent'>('buy');
    const [rentalStartDate, setRentalStartDate] = useState('');
    const [rentalEndDate, setRentalEndDate] = useState('');

    // Pending order state - for resuming QR payment
    const [pendingOrder, setPendingOrder] = useState<OrderResponse | null>(null);

    // Affiliate share link state
    const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [showShareWidget, setShowShareWidget] = useState(false);

    // Load pending order from localStorage on mount
    useEffect(() => {
        const storedOrder = localStorage.getItem(`pendingOrder_${id}`);
        if (storedOrder) {
            try {
                const order = JSON.parse(storedOrder) as OrderResponse;
                // Check if order is still valid (not expired)
                if (order.payment_expired_at) {
                    const expiredAt = new Date(order.payment_expired_at).getTime();
                    if (Date.now() < expiredAt) {
                        setPendingOrder(order);
                    } else {
                        // Expired - remove from localStorage
                        localStorage.removeItem(`pendingOrder_${id}`);
                    }
                }
            } catch (e) {
                localStorage.removeItem(`pendingOrder_${id}`);
            }
        }
    }, [id]);

    // Fetch affiliate code for logged-in users
    useEffect(() => {
        if (!isAuthenticated) return;
        api.get('/affiliate/me')
            .then(res => {
                if (res.data?.success && res.data?.data?.affiliate?.referral_code) {
                    setAffiliateCode(res.data.data.affiliate.referral_code);
                }
            })
            .catch(() => { /* Không phải affiliate – bình thường */ });
    }, [isAuthenticated]);

    useEffect(() => {
        loadPianoDetails();
    }, [id]);

    const loadPianoDetails = async () => {
        try {
            setLoading(true);
            const data = await pianoService.getById(Number(id));
            setPiano(data);

            if (isAuthenticated) {
                const favStatus = await favoriteService.isFavorited(Number(id));
                setIsFavorited(favStatus);
            }
        } catch (err: any) {
            setError(err.message || 'Không thể tải thông tin piano');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const numericId = Number(id);
        // Optimistic update
        const oldStatus = isFavorited;
        setIsFavorited(!oldStatus);

        try {
            if (oldStatus) {
                await favoriteService.removeFavorite(numericId);
            } else {
                await favoriteService.addFavorite(numericId);
            }
        } catch (error: any) {
            setIsFavorited(oldStatus); // Revert on error
            console.error('Error toggling favorite:', error);
        }
    };

    // State for showing rental date selection modal before payment
    const [showRentalModal, setShowRentalModal] = useState(false);

    const handleOpenModal = (type: 'buy' | 'rent') => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setModalType(type);

        if (type === 'rent') {
            // Show rental date selection first
            setShowRentalModal(true);
        } else {
            // Go directly to payment modal for buy
            setShowPaymentModal(true);
        }
    };

    const handleProceedToPayment = () => {
        if (modalType === 'rent' && (!rentalStartDate || !rentalEndDate || getRentalDays() < 1)) {
            alert('Vui lòng chọn ngày thuê hợp lệ');
            return;
        }
        setShowRentalModal(false);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        setPendingOrder(null); // Clear pending order on success
        localStorage.removeItem(`pendingOrder_${id}`); // Clear from localStorage
        navigate('/profile');
    };

    // Handle when a new QR order is created
    const handleOrderCreated = (order: OrderResponse) => {
        setPendingOrder(order);
        // Save to localStorage for persistence across page reloads
        localStorage.setItem(`pendingOrder_${id}`, JSON.stringify(order));
    };

    // Handle when pending order is cleared (expired or user resets)
    const handleOrderCleared = () => {
        setPendingOrder(null);
        localStorage.removeItem(`pendingOrder_${id}`);
    };

    // Check if there's a valid pending order (not expired)
    const hasPendingPayment = () => {
        if (!pendingOrder || pendingOrder.payment_method !== 'QR' || !pendingOrder.payment_expired_at) {
            return false;
        }
        const expiredAt = new Date(pendingOrder.payment_expired_at).getTime();
        return Date.now() < expiredAt;
    };

    // Handle clicking "Thanh toán" button to resume payment
    const handleResumePayment = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowPaymentModal(true);
    };

    // Tạo affiliate link cho sản phẩm này
    const getAffiliateProductLink = () => {
        const base = window.location.origin;
        return `${base}/piano/${id}?ref=${affiliateCode}`;
    };

    const handleCopyAffiliateLink = async () => {
        try {
            await navigator.clipboard.writeText(getAffiliateProductLink());
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
        } catch {
            // Fallback cho trình duyệt cũ
            const el = document.createElement('textarea');
            el.value = getAffiliateProductLink();
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
        }
    };

    const calculateRentalPrice = () => {
        if (!piano || !rentalStartDate || !rentalEndDate) return 0;

        const start = new Date(rentalStartDate);
        const end = new Date(rentalEndDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (days < 1) return 0;
        return orderService.calculateRentalPrice(piano.price_per_day, days);
    };

    const getRentalDays = () => {
        if (!rentalStartDate || !rentalEndDate) return 0;
        const start = new Date(rentalStartDate);
        const end = new Date(rentalEndDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !piano) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <p className="text-xl text-slate-700 dark:text-slate-300">{error}</p>
                        <GoldButton
                            onClick={() => navigate('/')}
                            className="mt-4 px-6 py-2 rounded-lg"
                        >
                            Quay lại trang chủ
                        </GoldButton>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const buyPrice = orderService.calculateBuyPrice(piano.price, piano.price_per_day);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Back Button */}
                <GoldButton
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 !bg-transparent !bg-none !p-0 text-slate-600 dark:text-slate-400 hover:text-primary mb-6 shadow-none"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Quay lại</span>
                </GoldButton>

                {/* Piano Detail Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Image */}
                        <div className="relative bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
                            <img
                                src={piano.image_url}
                                alt={piano.name}
                                className="max-h-96 object-contain"
                            />

                            {/* Favorite Button */}
                        </div>

                        {/* Info */}
                        <div className="p-8">
                            <div className="mb-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                                    {piano.category}
                                </span>
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex-1 pr-4">
                                    {piano.name}
                                </h1>
                                <button
                                    onClick={handleToggleFavorite}
                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none flex-shrink-0"
                                >
                                    <Heart
                                        className={`w-6 h-6 ${isFavorited
                                            ? 'fill-red-500 text-red-500'
                                            : 'text-slate-400'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(piano.rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    {piano.rating} ({piano.reviews_count} đánh giá)
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-slate-700 dark:text-slate-300 mb-6">
                                {piano.description}
                            </p>

                            {/* Features */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                                    Tính năng nổi bật:
                                </h3>
                                <ul className="space-y-2">
                                    {piano.features?.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pricing */}
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-xl mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Giá thuê:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(piano.price_per_day)}
                                    </span>
                                    <span className="text-slate-500">/ngày</span>
                                </div>
                                {(piano.price && piano.price > 0) && (
                                    <div className="flex items-baseline gap-2">
                                        <ShoppingCart className="w-5 h-5 text-green-600" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Giá mua:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(piano.price)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                {hasPendingPayment() ? (
                                    // Show single "Thanh toán" button when there's a pending QR payment
                                    <GoldButton
                                        onClick={handleResumePayment}
                                        className="col-span-2 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all bg-green-600 hover:bg-green-700"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Tiếp tục thanh toán
                                    </GoldButton>
                                ) : (
                                    // Normal buttons
                                    <>
                                        <GoldButton
                                            onClick={() => handleOpenModal('rent')}
                                            className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                                        >
                                            <Calendar className="w-5 h-5" />
                                            Mượn đàn
                                        </GoldButton>
                                        <GoldButton
                                            onClick={() => handleOpenModal('buy')}
                                            className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Mua đàn
                                        </GoldButton>
                                    </>
                                )}
                            </div>

                            {/* ── Affiliate Share Widget ────────────────────────────────
                                Chỉ hiển thị nếu user hiện tại là Affiliate.
                                Cho phép copy link sản phẩm kèm mã giới thiệu.
                            ─────────────────────────────────────────────────────── */}
                            {affiliateCode && (
                                <div style={{
                                    marginTop: 20,
                                    borderRadius: 14,
                                    border: '1px solid rgba(240,192,88,0.35)',
                                    background: 'linear-gradient(135deg, rgba(240,192,88,0.08), rgba(232,160,32,0.04))',
                                    overflow: 'hidden'
                                }}>
                                    {/* Header toggle */}
                                    <button
                                        onClick={() => setShowShareWidget(p => !p)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', padding: '12px 16px',
                                            background: 'none', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d19916ff', fontWeight: 700, fontSize: 14 }}>
                                            <Share2 style={{ width: 16, height: 16 }} />
                                            🔗 Chia sẻ & nhận hoa hồng
                                        </span>
                                        <span style={{ color: '#C89B30', fontSize: 18 }}>{showShareWidget ? '▲' : '▼'}</span>
                                    </button>

                                    {showShareWidget && (
                                        <div style={{ padding: '4px 16px 16px' }}>
                                            {/* Giải thích ngắn */}
                                            <p style={{ color: '#000000ff', fontSize: 12, marginBottom: 10 }}>
                                                Chia sẻ link này. Khi khách mua/thuê đàn thành công qua link của bạn,
                                                bạn sẽ nhận <strong style={{ color: '#c68e14ff' }}>hoa hồng tự động</strong>.
                                            </p>

                                            {/* Link box */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                background: 'rgba(0,0,0,0.15)', borderRadius: 10,
                                                padding: '10px 12px', border: '1px solid rgba(240,192,88,0.2)'
                                            }}>
                                                <Link style={{ width: 14, height: 14, color: '#F0C058', flexShrink: 0 }} />
                                                <span style={{
                                                    flex: 1, fontSize: 12, color: '#000000ff',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {getAffiliateProductLink()}
                                                </span>
                                                <button
                                                    id="copy-affiliate-link-btn"
                                                    onClick={handleCopyAffiliateLink}
                                                    title="Copy link"
                                                    style={{
                                                        flexShrink: 0, padding: '6px 12px', borderRadius: 8,
                                                        border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        background: linkCopied
                                                            ? 'rgba(16,185,129,0.2)'
                                                            : 'linear-gradient(135deg, #F0C058, #C89B30)',
                                                        color: linkCopied ? '#10B981' : '#1a1a1a',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {linkCopied
                                                        ? <><CheckCheck style={{ width: 14, height: 14 }} /> Đã copy!</>
                                                        : <><Copy style={{ width: 14, height: 14 }} /> Copy link</>
                                                    }
                                                </button>
                                            </div>

                                            {/* Badge mã giới thiệu */}
                                            <p style={{ color: '#64748B', fontSize: 11, marginTop: 8, textAlign: 'right' }}>
                                                Mã của bạn: <strong style={{ color: '#c08e24ff', fontFamily: 'monospace' }}>{affiliateCode}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rental Date Selection Modal */}
                {showRentalModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Chọn thời gian thuê
                                </h2>
                                <GoldButton
                                    onClick={() => setShowRentalModal(false)}
                                    className="!bg-transparent !bg-none !p-0 text-slate-400 hover:text-slate-600 shadow-none"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </GoldButton>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Ngày bắt đầu
                                    </label>
                                    <input
                                        type="date"
                                        value={rentalStartDate}
                                        onChange={(e) => setRentalStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        value={rentalEndDate}
                                        onChange={(e) => setRentalEndDate(e.target.value)}
                                        min={rentalStartDate || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                {rentalStartDate && rentalEndDate && getRentalDays() > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">
                                            Thời gian thuê: <span className="font-bold">{getRentalDays()} ngày</span>
                                        </p>
                                        {getRentalDays() >= 3 && (
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                🎉 Giảm {getRentalDays() >= 8 ? '15%' : '10%'} cho thuê dài hạn!
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateRentalPrice())}
                                    </span>
                                </div>
                            </div>

                            <GoldButton
                                onClick={handleProceedToPayment}
                                disabled={!rentalStartDate || !rentalEndDate || getRentalDays() < 1}
                                className="w-full py-3 px-6 rounded-lg font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Tiếp tục thanh toán
                            </GoldButton>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    orderType={pendingOrder?.type || modalType}
                    pianoId={piano.id}
                    pianoName={piano.name}
                    totalPrice={pendingOrder?.total_price || (modalType === 'buy' ? buyPrice : calculateRentalPrice())}
                    rentalStartDate={pendingOrder?.rental_start_date || (modalType === 'rent' ? rentalStartDate : undefined)}
                    rentalEndDate={pendingOrder?.rental_end_date || (modalType === 'rent' ? rentalEndDate : undefined)}
                    onSuccess={handlePaymentSuccess}
                    pendingOrder={pendingOrder}
                    onOrderCreated={handleOrderCreated}
                    onOrderCleared={handleOrderCleared}
                />
            </main>

            <Footer />
        </div>
    );
};
