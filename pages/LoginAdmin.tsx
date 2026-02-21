import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoldButton } from '../components/GoldButton';
import { useAuth } from '../contexts/AuthContext';
import authService from '../lib/authService';
import { Lock, Mail, AlertCircle, CheckCircle, User as UserIcon, Phone, Shield } from 'lucide-react';

type AdminRole = 'admin' | 'warehouse_owner';
type AuthMode = 'login' | 'register';
type LoginMethod = 'password' | 'otp';

export const LoginAdmin: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Mode: login / register
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [role, setRole] = useState<AdminRole>('admin');
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

    // Login fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Register fields
    const [registerData, setRegisterData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otp: '',
    });
    const [regOtpSent, setRegOtpSent] = useState(false);

    // Shared state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ──────────── LOGIN HANDLERS ────────────

    const handleSendLoginOtp = async () => {
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.sendOtp(email, 'magiclink');
            if (res.success) {
                setOtpSent(true);
                setError('');
                alert('Mã OTP đã được gửi đến email của bạn');
            } else {
                setError(res.message);
            }
        } catch {
            setError('Không thể gửi mã.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let res;
            if (loginMethod === 'password') {
                // Use admin login endpoint which enforces role check on backend
                res = await authService.adminLogin({ email, password, role });
            } else {
                // OTP login is generic, so we must check role manually after login
                res = await authService.loginOtp(email, otp);
            }

            if (!res.success) {
                setError(res.message);
                return;
            }

            const user = res.data.user;

            // Strict Role Check
            if (user.role !== 'admin' && user.role !== 'warehouse_owner') {
                await authService.logout();
                setError('Tài khoản này không có quyền truy cập trang quản trị.');
                return;
            }

            // Optional: Ensure they are logging in to the correct role tab (Admin vs Warehouse Owner)
            // Though flexible is fine, let's correspond to the UI toggle for clarity
            if (role === 'admin' && user.role !== 'admin') {
                await authService.logout();
                setError('Vui lòng chọn đúng vai trò "Chủ kho đàn" để đăng nhập.');
                return;
            }
            if (role === 'warehouse_owner' && user.role !== 'warehouse_owner') {
                await authService.logout();
                setError('Vui lòng chọn đúng vai trò "Admin" để đăng nhập.');
                return;
            }

            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ──────────── REGISTER HANDLERS ────────────

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleSendRegOtp = async () => {
        if (!registerData.email) {
            setError('Vui lòng nhập email');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.sendOtp(registerData.email, 'signup');
            if (res.success) {
                setRegOtpSent(true);
                setError('');
                alert('Mã xác thực đã được gửi đến email');
            } else {
                setError(res.message);
            }
        } catch {
            setError('Không thể gửi mã.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (registerData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (registerData.password !== registerData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (!registerData.otp) {
            setError('Vui lòng nhập mã xác thực');
            return;
        }

        setIsLoading(true);
        try {
            const res = await authService.adminRegister({
                email: registerData.email,
                password: registerData.password,
                full_name: registerData.full_name,
                phone: registerData.phone,
                role,
                token: registerData.otp,
            });

            if (!res.success) {
                setError(res.message);
                return;
            }

            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/admin'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Đăng ký thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ──────────── MODE SWITCH ────────────

    const switchMode = (mode: AuthMode) => {
        setAuthMode(mode);
        setError('');
        setSuccess('');
        setOtpSent(false);
        setRegOtpSent(false);
    };

    // ──────────── RENDER ────────────

    const roleLabelMap: Record<AdminRole, string> = {
        admin: 'Admin',
        warehouse_owner: 'Chủ kho đàn',
    };

    return (
        <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#F0C058] tracking-widest mb-2 font-display">
                        Xpiano
                    </h1>
                    <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        Quản trị hệ thống
                    </p>
                </div>

                {/* Auth Mode Tabs: Login / Register */}
                <div className="bg-[#1A1A1A] p-1 rounded-xl flex mb-4">
                    <GoldButton
                        onClick={() => switchMode('login')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'login'
                            ? 'shadow-sm'
                            : '!bg-[#111] !bg-none !text-slate-400 hover:!text-slate-200'
                            }`}
                    >
                        Đăng nhập
                    </GoldButton>
                    <GoldButton
                        onClick={() => switchMode('register')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'register'
                            ? 'shadow-sm'
                            : '!bg-[#111] !bg-none !text-slate-400 hover:!text-slate-200'
                            }`}
                    >
                        Đăng ký
                    </GoldButton>
                </div>

                {/* Role Tabs: Admin / Chủ kho đàn */}
                <div className="bg-[#1A1A1A] p-1 rounded-xl flex mb-6">
                    {(Object.keys(roleLabelMap) as AdminRole[]).map((r) => (
                        <GoldButton
                            key={r}
                            onClick={() => setRole(r)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === r
                                ? 'shadow-sm'
                                : '!bg-[#111] !bg-none !text-slate-400 hover:!text-slate-200'
                                }`}
                        >
                            {roleLabelMap[r]}
                        </GoldButton>
                    ))}
                </div>

                {/* Error / Success */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-200">{success}</p>
                    </div>
                )}

                {/* ═══════════ LOGIN FORM ═══════════ */}
                {authMode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] transition-all placeholder:text-slate-600"
                                placeholder="Email quản trị"
                            />
                        </div>

                        {/* Password or OTP */}
                        {loginMethod === 'password' ? (
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
                            </div>
                        ) : (
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
                                    onClick={handleSendLoginOtp}
                                    disabled={isLoading || otpSent}
                                    className="px-4 py-2 font-medium rounded-xl disabled:opacity-50 whitespace-nowrap"
                                >
                                    {otpSent ? 'Đã gửi' : 'Gửi mã'}
                                </GoldButton>
                            </div>
                        )}

                        {/* Toggle login method */}
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

                        {/* Submit */}
                        <GoldButton
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl font-bold shadow-lg shadow-[#F0C058]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6 uppercase tracking-wide"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </GoldButton>
                    </form>
                )}

                {/* ═══════════ REGISTER FORM ═══════════ */}
                {authMode === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-3">
                        {/* Full name */}
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                name="full_name"
                                value={registerData.full_name}
                                onChange={handleRegChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Họ và tên"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                name="email"
                                value={registerData.email}
                                onChange={handleRegChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Email"
                            />
                        </div>

                        {/* Phone */}
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="tel"
                                name="phone"
                                value={registerData.phone}
                                onChange={handleRegChange}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Số điện thoại"
                            />
                        </div>

                        {/* OTP */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🛡️</span>
                                <input
                                    type="text"
                                    name="otp"
                                    value={registerData.otp}
                                    onChange={handleRegChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                    placeholder="Mã xác thực"
                                />
                            </div>
                            <GoldButton
                                type="button"
                                onClick={handleSendRegOtp}
                                disabled={isLoading || regOtpSent}
                                className="px-4 font-semibold rounded-xl transition-colors"
                            >
                                {regOtpSent ? 'Đã gửi' : 'Gửi mã'}
                            </GoldButton>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                name="password"
                                value={registerData.password}
                                onChange={handleRegChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Mật khẩu"
                            />
                        </div>

                        {/* Confirm password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={registerData.confirmPassword}
                                onChange={handleRegChange}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-[#1A1A1A] text-white focus:ring-1 focus:ring-[#F0C058] focus:border-[#F0C058] placeholder:text-slate-600"
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>

                        {/* Role info */}
                        <div className="p-3 bg-[#1A1A1A] border border-slate-700 rounded-xl">
                            <p className="text-xs text-slate-400">
                                {role === 'admin'
                                    ? '🔑 Admin: CRUD đàn piano, quản lý đơn hàng, quản lý actor, tạo tài khoản chủ kho đàn.'
                                    : '📦 Chủ kho đàn: Quản lý đơn hàng của mình, quản lý doanh thu.'}
                            </p>
                        </div>

                        {/* Submit */}
                        <GoldButton
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl font-bold shadow-lg shadow-[#F0C058]/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 uppercase tracking-wide"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </GoldButton>
                    </form>
                )}

                {/* Back to user login */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Bạn là người dùng?{' '}
                        <Link to="/login" className="text-[#F0C058] hover:text-[#d9ab4b] font-semibold">
                            Đăng nhập tại đây
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
