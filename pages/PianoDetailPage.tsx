import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoldButton } from '../components/GoldButton';
import { Heart, ShoppingCart, Calendar, Star, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import pianoService, { Piano } from '../lib/pianoService';
import favoriteService from '../lib/favoriteService';
import orderService from '../lib/orderService';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const PianoDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [piano, setPiano] = useState<Piano | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Buy/Rent Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'buy' | 'rent'>('buy');
    const [rentalStartDate, setRentalStartDate] = useState('');
    const [rentalEndDate, setRentalEndDate] = useState('');
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

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

    const handleOpenModal = (type: 'buy' | 'rent') => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setModalType(type);
        setShowModal(true);
        setOrderSuccess(false);
    };

    const calculateRentalPrice = () => {
        if (!piano || !rentalStartDate || !rentalEndDate) return 0;

        const start = new Date(rentalStartDate);
        const end = new Date(rentalEndDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (days < 1) return 0;
        return orderService.calculateRentalPrice(piano.price_per_hour, days);
    };

    const getRentalDays = () => {
        if (!rentalStartDate || !rentalEndDate) return 0;
        const start = new Date(rentalStartDate);
        const end = new Date(rentalEndDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    const handlePlaceOrder = async () => {
        if (!piano) return;

        try {
            setOrderLoading(true);

            await orderService.createOrder({
                piano_id: piano.id,
                type: modalType,
                rental_start_date: modalType === 'rent' ? rentalStartDate : undefined,
                rental_end_date: modalType === 'rent' ? rentalEndDate : undefined,
            });

            setOrderSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                navigate('/profile');
            }, 2000);
        } catch (error: any) {
            alert(error.message || 'Đặt hàng thất bại');
        } finally {
            setOrderLoading(false);
        }
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

    const buyPrice = orderService.calculateBuyPrice(piano.price_per_hour);

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
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(piano.price_per_hour)}
                                    </span>
                                    <span className="text-slate-500">/giờ</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <ShoppingCart className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Giá mua:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(buyPrice)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">

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

                            </div>
                        </div>
                    </div>
                </div>

                {/* Buy/Rent Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                            {orderSuccess ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        Đặt hàng thành công!
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Đơn hàng của bạn đang chờ xét duyệt. Chúng tôi sẽ liên hệ sớm nhất!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {modalType === 'buy' ? 'Mua đàn' : 'Mượn đàn'}
                                        </h2>
                                        <GoldButton
                                            onClick={() => setShowModal(false)}
                                            className="!bg-transparent !bg-none !p-0 text-slate-400 hover:text-slate-600 shadow-none"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </GoldButton>
                                    </div>

                                    {modalType === 'rent' && (
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
                                    )}

                                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600 dark:text-slate-400">Tổng cộng:</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                    modalType === 'buy' ? buyPrice : calculateRentalPrice()
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <GoldButton
                                        onClick={handlePlaceOrder}
                                        disabled={orderLoading || (modalType === 'rent' && (!rentalStartDate || !rentalEndDate || getRentalDays() < 1))}
                                        className="w-full py-3 px-6 rounded-lg font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {orderLoading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                                    </GoldButton>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                                        Đơn hàng sẽ được xét duyệt trong vòng 24h
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};
