import React, { useState, useEffect, useCallback } from 'react';
import { GoldButton } from './GoldButton';
import { Copy, CheckCircle, Clock, XCircle, CreditCard, Banknote, QrCode } from 'lucide-react';
import orderService, { OrderResponse, PaymentMethod, BankInfo } from '../lib/orderService';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderType: 'buy' | 'rent';
    pianoId: number;
    pianoName: string;
    totalPrice: number;
    rentalStartDate?: string;
    rentalEndDate?: string;
    onSuccess: () => void;
    // New: For resuming pending payment
    pendingOrder?: OrderResponse | null;
    onOrderCreated?: (order: OrderResponse) => void;
    onOrderCleared?: () => void; // Called when pending order expires or user resets
}

type PaymentStep = 'select' | 'qr' | 'success' | 'expired' | 'cancelled';

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    orderType,
    pianoId,
    pianoName,
    totalPrice,
    rentalStartDate,
    rentalEndDate,
    onSuccess,
    pendingOrder,
    onOrderCreated,
    onOrderCleared
}) => {
    const [step, setStep] = useState<PaymentStep>('select');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [authError, setAuthError] = useState(false); // Track auth issues
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
    const [copied, setCopied] = useState<string | null>(null);

    // Reset state when modal opens - or resume pending order
    useEffect(() => {
        if (isOpen) {
            if (pendingOrder && pendingOrder.payment_method === 'QR' && pendingOrder.payment_expired_at) {
                // Resume pending QR payment
                const expiredAt = new Date(pendingOrder.payment_expired_at).getTime();
                const now = Date.now();
                if (now < expiredAt) {
                    setOrder(pendingOrder);
                    setPaymentMethod('QR');
                    setStep('qr');
                    return;
                }
            }
            // Default: start fresh
            setStep('select');
            setPaymentMethod('COD');
            setLoading(false);
            setCancelling(false);
            setAuthError(false);
            setOrder(null);
            setTimeLeft(0);
        }
    }, [isOpen, pendingOrder]);

    // Countdown timer for QR payment
    useEffect(() => {
        if (step !== 'qr' || !order?.payment_expired_at) return;

        const updateTimer = () => {
            const expiredAt = new Date(order.payment_expired_at!).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((expiredAt - now) / 1000));
            
            setTimeLeft(remaining);

            if (remaining <= 0) {
                setStep('expired');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [step, order]);

    // Poll for payment status
    useEffect(() => {
        if (step !== 'qr' || !order?.id) return;

        const checkStatus = async () => {
            try {
                const status = await orderService.checkOrderStatus(order.id);
                setAuthError(false); // Reset auth error on success
                if (status.status === 'approved') {
                    setStep('success');
                } else if (status.status === 'cancelled') {
                    setStep('cancelled');
                } else if (status.is_expired) {
                    setStep('expired');
                }
            } catch (error: any) {
                console.error('Error checking status:', error);
                // Check if it's an auth error (401)
                if (error.message?.includes('401') || 
                    error.message?.includes('không hợp lệ') || 
                    error.message?.includes('hết hạn')) {
                    setAuthError(true);
                }
            }
        };

        // Check immediately on mount
        checkStatus();
        
        const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [step, order]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleCopy = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(field);
            setTimeout(() => setCopied(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const orderData = {
                piano_id: pianoId,
                type: orderType,
                rental_start_date: rentalStartDate,
                rental_end_date: rentalEndDate,
                payment_method: paymentMethod
            };

            const response = await orderService.createOrder(orderData);
            setOrder(response);

            if (paymentMethod === 'COD') {
                setStep('success');
            } else {
                // QR payment - show QR code
                setStep('qr');
                // Notify parent about the new order so they can track it
                if (onOrderCreated) {
                    onOrderCreated(response);
                }
            }
        } catch (error: any) {
            alert(error.message || 'Đặt hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        onSuccess();
        onClose();
    };

    // Handle cancel order
    const handleCancelOrder = async () => {
        if (!order?.id) return;
        
        setCancelling(true);
        try {
            await orderService.cancelOrder(order.id);
            setStep('cancelled');
        } catch (error: any) {
            // Check if it's an auth error
            if (error.message?.includes('401') || 
                error.message?.includes('không hợp lệ') || 
                error.message?.includes('hết hạn')) {
                setAuthError(true);
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để hủy đơn hàng.');
            } else {
                alert(error.message || 'Không thể hủy đơn hàng');
            }
        } finally {
            setCancelling(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {step === 'select' && 'Chọn phương thức thanh toán'}
                        {step === 'qr' && 'Thanh toán chuyển khoản'}
                        {step === 'success' && 'Đặt hàng thành công!'}
                        {step === 'expired' && 'Hết thời gian thanh toán'}
                        {step === 'cancelled' && 'Đã hủy đơn hàng'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <XCircle className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Step: Select Payment Method */}
                    {step === 'select' && (
                        <>
                            {/* Order Summary */}
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-6">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    Đơn hàng: <span className="font-semibold text-slate-900 dark:text-white">{pianoName}</span>
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Loại: <span className="font-semibold">{orderType === 'buy' ? 'Mua' : 'Thuê'}</span>
                                </p>
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Tổng cộng:</span>
                                        <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Options */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                                        paymentMethod === 'COD'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`p-3 rounded-full ${paymentMethod === 'COD' ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        <Banknote className={`w-6 h-6 ${paymentMethod === 'COD' ? 'text-primary' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className={`font-semibold ${paymentMethod === 'COD' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                            Thanh toán khi nhận hàng (COD)
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Nhân viên sẽ liên hệ xác nhận đơn hàng
                                        </p>
                                    </div>
                                    {paymentMethod === 'COD' && (
                                        <CheckCircle className="w-6 h-6 text-primary" />
                                    )}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('QR')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                                        paymentMethod === 'QR'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`p-3 rounded-full ${paymentMethod === 'QR' ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        <QrCode className={`w-6 h-6 ${paymentMethod === 'QR' ? 'text-primary' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className={`font-semibold ${paymentMethod === 'QR' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                            Chuyển khoản (VietQR)
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Quét mã QR để thanh toán ngay
                                        </p>
                                    </div>
                                    {paymentMethod === 'QR' && (
                                        <CheckCircle className="w-6 h-6 text-primary" />
                                    )}
                                </button>
                            </div>

                            <GoldButton
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                            </GoldButton>
                        </>
                    )}

                    {/* Step: QR Payment */}
                    {step === 'qr' && order && (
                        <>
                            {/* Countdown Timer */}
                            <div className="flex items-center justify-center gap-2 mb-4 text-orange-600 dark:text-orange-400">
                                <Clock className="w-5 h-5" />
                                <span className="font-semibold">
                                    Thời gian còn lại: {formatTime(timeLeft)}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000"
                                    style={{ width: `${(timeLeft / 3600) * 100}%` }}
                                />
                            </div>

                            {/* QR Code */}
                            {order.qr_url && (
                                <div className="flex justify-center mb-6">
                                    <div className="bg-white p-4 rounded-xl shadow-lg">
                                        <img 
                                            src={order.qr_url} 
                                            alt="QR Code thanh toán" 
                                            className="w-64 h-64 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Bank Info */}
                            {order.bank_info && (
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-6 space-y-3">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                                        Thông tin chuyển khoản:
                                    </h4>
                                    
                                    <InfoRow 
                                        label="Ngân hàng"
                                        value={order.bank_info.bank_name}
                                        onCopy={() => handleCopy(order.bank_info!.bank_name, 'bank')}
                                        copied={copied === 'bank'}
                                    />
                                    <InfoRow 
                                        label="Số tài khoản"
                                        value={order.bank_info.account_number}
                                        onCopy={() => handleCopy(order.bank_info!.account_number, 'account')}
                                        copied={copied === 'account'}
                                    />
                                    <InfoRow 
                                        label="Số tiền"
                                        value={formatCurrency(order.bank_info.amount)}
                                        onCopy={() => handleCopy(order.bank_info!.amount.toString(), 'amount')}
                                        copied={copied === 'amount'}
                                    />
                                    <InfoRow 
                                        label="Nội dung CK"
                                        value={order.bank_info.description}
                                        onCopy={() => handleCopy(order.bank_info!.description, 'description')}
                                        copied={copied === 'description'}
                                        highlight
                                    />
                                </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    💡 <strong>Lưu ý:</strong> Vui lòng nhập chính xác nội dung chuyển khoản <strong>{order.bank_info?.description}</strong> để hệ thống tự động xác nhận thanh toán.
                                </p>
                            </div>

                            {/* Auth Error Warning */}
                            {authError && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        ⚠️ <strong>Phiên đăng nhập đã hết hạn.</strong> Nếu bạn đã chuyển khoản thành công, đơn hàng vẫn sẽ được xử lý. Vui lòng đăng nhập lại để kiểm tra trạng thái đơn hàng.
                                    </p>
                                </div>
                            )}

                            {!authError ? (
                                <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-6">
                                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                    <span className="text-sm">Đang chờ thanh toán...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 mb-6">
                                    <span className="text-sm">Không thể kiểm tra trạng thái tự động</span>
                                </div>
                            )}

                            {/* Cancel Button */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                    className="w-full py-3 px-6 rounded-lg font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                    {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                {paymentMethod === 'QR' ? 'Thanh toán thành công!' : 'Đặt hàng thành công!'}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                {paymentMethod === 'QR' 
                                    ? 'Chúng tôi đã nhận được thanh toán và sẽ xử lý đơn hàng của bạn sớm nhất.'
                                    : 'Đơn hàng của bạn đang chờ xét duyệt. Chúng tôi sẽ liên hệ sớm nhất!'
                                }
                            </p>
                            {order && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Mã đơn hàng: <strong>#{order.id}</strong>
                                </p>
                            )}
                            <GoldButton
                                onClick={handleSuccessClose}
                                className="px-8 py-3 rounded-lg font-semibold"
                            >
                                Xem đơn hàng
                            </GoldButton>
                        </div>
                    )}

                    {/* Step: Expired */}
                    {step === 'expired' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                Hết thời gian thanh toán
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Đơn hàng đã bị hủy do quá thời gian thanh toán 60 phút.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        if (onOrderCleared) onOrderCleared();
                                        onClose();
                                    }}
                                    className="px-6 py-3 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Đóng
                                </button>
                                <GoldButton
                                    onClick={() => {
                                        if (onOrderCleared) onOrderCleared();
                                        setOrder(null);
                                        setStep('select');
                                    }}
                                    className="px-6 py-3 rounded-lg font-semibold"
                                >
                                    Đặt lại
                                </GoldButton>
                            </div>
                        </div>
                    )}

                    {/* Step: Cancelled */}
                    {step === 'cancelled' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                Đã hủy đơn hàng
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Đơn hàng của bạn đã được hủy thành công.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        if (onOrderCleared) onOrderCleared();
                                        onClose();
                                    }}
                                    className="px-6 py-3 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Đóng
                                </button>
                                <GoldButton
                                    onClick={() => {
                                        if (onOrderCleared) onOrderCleared();
                                        setOrder(null);
                                        setStep('select');
                                    }}
                                    className="px-6 py-3 rounded-lg font-semibold"
                                >
                                    Đặt lại
                                </GoldButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper component for bank info rows
const InfoRow: React.FC<{
    label: string;
    value: string;
    onCopy: () => void;
    copied: boolean;
    highlight?: boolean;
}> = ({ label, value, onCopy, copied, highlight }) => (
    <div className="flex items-center justify-between">
        <span className="text-slate-600 dark:text-slate-400">{label}:</span>
        <div className="flex items-center gap-2">
            <span className={`font-semibold ${highlight ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                {value}
            </span>
            <button
                onClick={onCopy}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="Sao chép"
            >
                {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                )}
            </button>
        </div>
    </div>
);

export default PaymentModal;
