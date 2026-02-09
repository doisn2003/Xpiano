import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Music, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
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
            if (loginMethod === 'password') {
                await login(email, password);
            } else {
                // Login with OTP
                await authService.loginOtp(email, otp);
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
                        SPIANO
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Học đàn & Cà phê
                    </p>
                </div>

                {/* Role Tabs */}
                <div className="bg-[#1A1A1A] p-1 rounded-xl flex mb-6">
                    <button
                        onClick={() => setRole('user')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'user'
                            ? 'bg-[#111] text-[#F0C058] border border-[#F0C058]/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Khách/Học viên
                    </button>
                    <button
                        onClick={() => setRole('teacher')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'teacher'
                            ? 'bg-[#111] text-[#F0C058] border border-[#F0C058]/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Giáo viên
                    </button>
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
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] transition-all placeholder:text-slate-600"
                                        placeholder="Mật khẩu"
                                    />
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">

                                    </button>
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
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isLoading || otpSent}
                                        className="px-4 py-2 bg-[#F0C058] text-black font-medium rounded-xl hover:bg-[#d9ab4b] disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {otpSent ? 'Đã gửi' : 'Gửi mã'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm mt-2">
                            <Link to="/forgot-password" className="text-slate-400 hover:text-[#F0C058] transition-colors">
                                Quên mật khẩu?
                            </Link>
                            <button
                                type="button"
                                onClick={() => setLoginMethod(loginMethod === 'password' ? 'otp' : 'password')}
                                className="text-[#F0C058] hover:text-[#d9ab4b] font-medium transition-colors"
                            >
                                {loginMethod === 'password' ? 'Đăng nhập bằng OTP' : 'Đăng nhập bằng Mật khẩu'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#F0C058] to-[#d9ab4b] hover:from-[#E0B048] hover:to-[#c99b3b] text-[#111] py-3.5 rounded-xl font-bold shadow-lg shadow-[#F0C058]/20 hover:shadow-[#F0C058]/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6 uppercase tracking-wide"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                        <p className="text-slate-500 text-xs">Hoặc đăng nhập bằng</p>
                        <div className="h-[1px] bg-slate-800 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <button className="flex items-center justify-center py-3 bg-[#1A1A1A] border border-slate-700 rounded-full hover:bg-slate-800 transition-colors group">
                            <span className="font-bold text-white">G</span>
                        </button>
                        <button className="flex items-center justify-center py-3 bg-[#1A1A1A] border border-slate-700 rounded-full hover:bg-slate-800 transition-colors">
                            <span className="font-bold text-white"></span>
                        </button>
                        <button className="flex items-center justify-center py-3 bg-[#1A1A1A] border border-slate-700 rounded-full hover:bg-slate-800 transition-colors">
                            <span className="font-bold text-white">💬</span>
                        </button>
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
