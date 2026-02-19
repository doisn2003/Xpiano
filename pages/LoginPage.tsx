import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoldButton } from '../components/GoldButton';
// import { useAuth } from '../contexts/AuthContext'; // Unused login destructuring
import authService from '../lib/authService';
import { Music, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    // const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'user' | 'teacher'>('user');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleSendOtp = async () => {
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.sendOtp(email, 'magiclink'); // Using magiclink type for login OTP
            if (res.success) {
                setOtpSent(true);
                setError('');
                alert('Mã OTP đã được gửi đến email của bạn');
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
        setIsLoading(true);

        try {
            let res;
            if (loginMethod === 'password') {
                res = await authService.login({ email, password });
            } else {
                // Login with OTP
                res = await authService.loginOtp(email, otp);
            }

            if (!res.success) {
                setError(res.message);
                return;
            }

            const user = res.data.user;

            // 1. Block Admins/Warehouse Owners from this page
            if (user.role === 'admin' || user.role === 'warehouse_owner') {
                // Logout immediately to clear the invalid session
                await authService.logout();
                setError('Tài khoản quản trị vui lòng đăng nhập tại trang dành cho Admin.');
                return;
            }

            // 2. Enforce Role Selection (Teacher vs User)
            if (role === 'teacher' && user.role !== 'teacher') {
                await authService.logout();
                setError('Tài khoản này không phải là Giáo viên. Vui lòng chọn tab "Khách/Học viên".');
                return;
            }

            if (role === 'user' && user.role === 'teacher') {
                await authService.logout();
                setError('Đây là tài khoản Giáo viên. Vui lòng chọn tab "Giáo viên".');
                return;
            }

            navigate(role === 'teacher' ? '/teacher-dashboard' : '/'); // Redirect based on role
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#F0C058] tracking-widest mb-2 font-display">
                        Xpiano
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Âm nhạc & nghệ thuật
                    </p>
                </div>

                {/* Role Tabs */}
                <div className="bg-[#1A1A1A] p-1 rounded-xl flex mb-6">
                    <GoldButton
                        onClick={() => setRole('user')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'user'
                            ? 'shadow-sm'
                            : '!bg-[#111] !bg-none !text-slate-400 hover:!text-slate-200'
                            }`}
                    >
                        Khách/Học viên
                    </GoldButton>
                    <GoldButton
                        onClick={() => setRole('teacher')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'teacher'
                            ? 'shadow-sm'
                            : '!bg-[#111] !bg-none !text-slate-400 hover:!text-slate-200'
                            }`}
                    >
                        Giáo viên
                    </GoldButton>
                </div>

                {/* Login Form */}
                <div className="bg-transparent rounded-2xl p-0">
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] transition-all placeholder:text-slate-600"
                                    placeholder="Số điện thoại / Email"
                                />
                            </div>
                        </div>

                        {loginMethod === 'password' ? (
                            <div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] transition-all placeholder:text-slate-600"
                                        placeholder="Mật khẩu"
                                    />
                                    <GoldButton
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="!absolute right-4 top-1/2 -translate-y-1/2 !bg-transparent !bg-none !p-0 text-slate-500 hover:text-slate-300 shadow-none border-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </GoldButton>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="relative flex gap-2">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] transition-all placeholder:text-slate-600"
                                        placeholder="Mã xác thực (OTP)"
                                    />
                                    <GoldButton
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isLoading || otpSent}
                                        className="px-4 py-2 font-medium rounded-xl disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {otpSent ? 'Đã gửi' : 'Gửi mã'}
                                    </GoldButton>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm mt-2">
                            <Link to="/forgot-password" className="text-slate-400 hover:text-[#F0C058] transition-colors">
                                Quên mật khẩu?
                            </Link>
                            <GoldButton
                                type="button"
                                onClick={() => setLoginMethod(loginMethod === 'password' ? 'otp' : 'password')}
                                className="!bg-transparent !bg-none text-[#F0C058] hover:text-[#d9ab4b] font-medium transition-colors !p-0"
                            >
                                {loginMethod === 'password' ? 'Đăng nhập bằng OTP' : 'Đăng nhập bằng Mật khẩu'}
                            </GoldButton>
                        </div>

                        <GoldButton
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl font-bold shadow-lg shadow-[#F0C058]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6 uppercase tracking-wide"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </GoldButton>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                        <p className="text-slate-500 text-xs">Hoặc đăng nhập bằng</p>
                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <GoldButton className="flex items-center justify-center py-3 !bg-[#1A1A1A] !bg-none border border-slate-700 rounded-full hover:!bg-slate-800 transition-colors group">
                            <span className="font-bold text-white">Google</span>
                        </GoldButton>
                        <GoldButton
                            onClick={() => navigate('/login-admin')}
                            className="flex items-center justify-center py-3 !bg-[#1A1A1A] !bg-none border border-slate-700 rounded-full hover:!bg-slate-800 transition-colors"
                        >
                            <span className="font-bold text-white">Admin</span>
                        </GoldButton>
                        <GoldButton className="flex items-center justify-center py-3 !bg-[#1A1A1A] !bg-none border border-slate-700 rounded-full hover:!bg-slate-800 transition-colors">
                            <span className="font-bold text-white">iCloud</span>
                        </GoldButton>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-[#F0C058] hover:text-[#d9ab4b] font-semibold">
                                Đăng ký
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
