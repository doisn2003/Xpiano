import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../lib/authService';
import { Music, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email); // Reused method which now sends OTP
            if (response.success) {
                setStep('otp');
                setSuccess('Mã xác thực đã được gửi đến email của bạn');
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError('Không thể gửi mã. Vui lòng kiểm tra lại email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.resetPassword(newPassword, email, otp);
            if (response.success) {
                setSuccess('Đổi mật khẩu thành công! Đang chuyển hướng...');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#F0C058] tracking-widest mb-1 font-display">
                        Quên mật khẩu?
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {step === 'email' ? 'Nhập email để nhận mã xác thực' : 'Nhập mã xác thực và mật khẩu mới'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-transparent">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-200">{success}</p>
                        </div>
                    )}

                    {step === 'email' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#F0C058] hover:bg-[#d9ab4b] text-[#111] py-3.5 rounded-xl font-bold shadow-lg shadow-[#F0C058]/20 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-wide"
                            >
                                {isLoading ? 'Đang gửi...' : 'Gửi mã'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🛡️</span>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                    placeholder="Mã xác thực 6 số"
                                />
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔒</span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                    placeholder="Mật khẩu mới"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#F0C058] hover:bg-[#d9ab4b] text-[#111] py-3.5 rounded-xl font-bold shadow-lg shadow-[#F0C058]/20 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-wide"
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#F0C058] text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
