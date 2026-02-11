import React from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PartnersPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-slate-900/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">


                <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up mt-12 md:mt-0">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                        Đối Tác Của Xpiano
                    </h1>

                    <p className="text-lg md:text-xl text-slate-200 mb-8 font-light leading-relaxed">
                        "Quý vị là chủ kho đàn và muốn hợp tác cùng phát triển hệ sinh thái âm nhạc hàng đầu?"
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="p-4 rounded-full bg-primary/20 text-primary mb-2 ring-1 ring-primary/50 ring-offset-2 ring-offset-transparent">
                            <Mail className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        </div>

                        <div className="text-white">
                            <p className="text-sm text-slate-300 uppercase tracking-widest mb-2">Vui lòng liên hệ email</p>
                            <a
                                href="mailto:xpiano@gmail.com"
                                className="text-2xl md:text-4xl font-bold hover:text-primary transition-colors duration-300 flex items-center gap-3"
                            >
                                xpiano@gmail.com
                                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </a>
                        </div>
                    </div>
                </div>
                
            </div>
            <button
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 md:top-8 md:left-8 group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 border border-white/30 hover:border-white/50 backdrop-blur-md"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Trang chủ</span>
                </button>
        </div>
    );
};
