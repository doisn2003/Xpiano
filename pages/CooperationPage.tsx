import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GoldButton } from '../components/GoldButton';
import { CheckCircle, TrendingUp, Users, DollarSign } from 'lucide-react';

const CooperationPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-body">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="relative py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                            Hợp Tác Cùng Xpiano
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Trở thành đối tác Affiliate của chúng tôi và nhận hoa hồng hấp dẫn.
                            <br />
                            Chia sẻ đam mê - Gia tăng thu nhập.
                        </p>
                        <GoldButton
                            onClick={() => navigate('/profile?tab=affiliate')}
                            className="px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                        >
                            Đăng ký Affiliate ngay
                        </GoldButton>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="py-20 container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Tại sao nên tham gia?</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Hệ thống Affiliate của Xpiano được thiết kế để tối đa hóa lợi nhuận cho bạn với quy trình đơn giản và minh bạch.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Benefit 1 */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-yellow-400 transition-colors group">
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Hoa hồng 10%</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Nhận ngay 10% giá trị đơn hàng cho mỗi lượt giới thiệu thành công. Mức hoa hồng cạnh tranh nhất thị trường nhạc cụ.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-blue-400 transition-colors group">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Thu nhập thụ động</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Chỉ cần chia sẻ liên kết một lần, bạn có thể nhận hoa hồng mãi mãi khi khách hàng tiếp tục mua sắm qua liên kết của bạn.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-green-400 transition-colors group">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Thanh toán nhanh chóng</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Hệ thống ghi nhận doanh thu tức thì. Bạn có thể yêu cầu rút tiền về tài khoản ngân hàng bất cứ lúc nào khi đạt ngưỡng tối thiểu.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <div className="py-20 bg-slate-100 dark:bg-slate-800/50">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">Quy trình hoạt động</h2>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
                            <div className="flex-1 p-6">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">1. Đăng ký</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Đăng ký tài khoản và kích hoạt Affiliate tại trang cá nhân.</p>
                            </div>
                            <div className="hidden md:block text-slate-300 dark:text-slate-600">
                                <TrendingUp className="w-8 h-8 transform rotate-90 md:rotate-0" />
                            </div>
                            <div className="flex-1 p-6">
                                <div className="text-6xl mb-4">🔗</div>
                                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">2. Chia sẻ</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Lấy link giới thiệu sản phẩm và chia sẻ trên mạng xã hội.</p>
                            </div>
                            <div className="hidden md:block text-slate-300 dark:text-slate-600">
                                <TrendingUp className="w-8 h-8 transform rotate-90 md:rotate-0" />
                            </div>
                            <div className="flex-1 p-6">
                                <div className="text-6xl mb-4">💰</div>
                                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">3. Nhận tiền</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Nhận hoa hồng tự động khi có người mua hàng qua link của bạn.</p>
                            </div>
                        </div>

                        <div className="mt-12">
                            <GoldButton
                                onClick={() => navigate('/profile?tab=affiliate')}
                                className="px-10 py-3 text-lg font-bold"
                            >
                                Bắt đầu ngay
                            </GoldButton>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CooperationPage;
