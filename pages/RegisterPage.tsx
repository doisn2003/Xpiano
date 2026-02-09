import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Music, Lock, Mail, User as UserIcon, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { registerVerify } = useAuth(); // Use new method
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        date_of_birth: '',
        role: 'user' as 'user' | 'teacher',
        otp: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            setError('Vui lòng nhập email');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.sendOtp(formData.email, 'signup');
            if (res.success) {
                setOtpSent(true);
                setError('');
                alert('Mã xác thực đã được gửi đến email của bạn');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Không thể gửi mã.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (!formData.otp) {
            setError('Vui lòng nhập mã xác thực');
            return;
        }

        setIsLoading(true);

        try {
            await authService.registerVerify({
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone,
                role: formData.role,
                date_of_birth: formData.date_of_birth,
                token: formData.otp
            });
            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#F0C058] tracking-widest mb-1 font-display">
                        Đăng ký tài khoản
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Tạo tài khoản để tham gia cộng đồng Spiano
                    </p>
                </div>

                {/* Role Tabs */}
                <div className="bg-[#1A1A1A] p-1 rounded-xl flex mb-6">
                    <button
                        onClick={() => setFormData({ ...formData, role: 'user' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.role === 'user'
                                ? 'bg-[#111] text-[#F0C058] border border-[#F0C058]/30 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Khách/Học viên
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, role: 'teacher' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.role === 'teacher'
                                ? 'bg-[#111] text-[#F0C058] border border-[#F0C058]/30 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Giáo viên
                    </button>
                </div>

                {/* Register Form */}
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

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Họ và tên"
                            />
                        </div>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">📅</span>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600 [color-scheme:dark]"
                                placeholder="Ngày sinh (DD/MM/YYYY)"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Email"
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🛡️</span>
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                    placeholder="Mã xác thực"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isLoading || otpSent}
                                className="px-4 bg-[#1A1A1A] border border-[#F0C058] text-[#F0C058] font-semibold rounded-xl hover:bg-[#F0C058] hover:text-black transition-colors"
                            >
                                {otpSent ? 'Đã gửi' : 'Gửi mã'}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Mật khẩu"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>

                        <div className="flex items-start gap-2 mt-2">
                            <input type="checkbox" required className="mt-1 rounded bg-[#1A1A1A] border-slate-700 text-[#F0C058] focus:ring-[#F0C058]" />
                            <span className="text-xs text-slate-400">Tôi đồng ý với Điều khoản & Chính sách</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#F0C058] hover:bg-[#d9ab4b] text-[#111] py-3.5 rounded-xl font-bold shadow-lg shadow-[#F0C058]/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 uppercase tracking-wide"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-sm">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-[#F0C058] hover:text-[#d9ab4b] font-semibold">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
