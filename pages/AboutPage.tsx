import React from 'react';
import { Music, Video, Users, ShoppingCart, Globe, ShieldCheck, PlayCircle, MonitorPlay, CreditCard } from 'lucide-react';

export const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 pt-20">
            {/* Hero Section */}
            <div className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=2070&auto=format&fit=crop"
                        alt="Piano Background"
                        className="w-full h-full object-cover opacity-10 dark:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 dark:via-slate-900/80 dark:to-slate-900"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Về <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-600">Xpiano</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Hệ sinh thái âm nhạc toàn diện kết nối Đam mê, Giáo dục và Thương mại.
                    </p>
                </div>
            </div>

            {/* Sơ lược hoạt động */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1470019693664-1d202d2c090f?q=80&w=2069&auto=format&fit=crop"
                                    alt="Overview"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <span className="text-white text-lg font-medium">Kết nối cộng đồng yêu nhạc</span>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white relative inline-block">
                                Sơ lược hoạt động
                                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
                            </h2>
                            <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300">
                                <p className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                                        <Globe className="w-5 h-5" />
                                    </span>
                                    <span>
                                        <strong>Hệ thống kết nối:</strong> Phục vụ chủ kho đàn đem cho thuê các cây đàn pianos chất lượng cao.
                                    </span>
                                </p>
                                <p className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                                        <Users className="w-5 h-5" />
                                    </span>
                                    <span>
                                        <strong>Đa nền tảng:</strong> App mobile chuyên biệt cho mạng xã hội chia sẻ video chơi đàn. Website chuyên biệt cho dạy và học chơi đàn piano.
                                    </span>
                                </p>
                                <p className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5" />
                                    </span>
                                    <span>
                                        <strong>Linh hoạt:</strong> Khách hàng có thể mượn đàn, mua đàn và tham gia các khóa học. Giáo viên dễ dàng mở lớp học.
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Các tính năng nổi bật */}
            <section className="py-16 md:py-24 bg-white dark:bg-slate-800/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Các Tính Năng Nổi Bật</h2>
                        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-500/30">
                                <Video className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Chia Sẻ & Kiếm Tiền</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Chia sẻ video chơi đàn, thể hiện bản thân và kiếm thêm thu nhập hấp dẫn nhờ chương trình affiliates.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
                                <MonitorPlay className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Lớp Học Online 4.0</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Kết nối website với cây đàn yêu thích. Trải nghiệm mượt mà với cây đàn của giáo viên qua cổng HDMI.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                                <CreditCard className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Thanh Toán & Giao Hàng</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Hệ thống thanh toán tự động an toàn. Dịch vụ giao hàng siêu tốc đảm bảo nhạc cụ đến tay bạn nhanh nhất.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Bạn đã sẵn sàng cùng Xpiano?</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/register" className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all transform hover:scale-105">
                            Đăng Ký Ngay
                        </a>
                        <a href="/marketplace" className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105">
                            Khám Phá Piano
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};
