import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LearnPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=2070&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-2xl mx-auto animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-lg">
                    Học Đàn
                </h1>
                <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
                <p className="text-xl md:text-2xl text-slate-200 font-light leading-relaxed mb-10 border border-white/20 p-8 rounded-2xl bg-white/10 backdrop-blur-md shadow-xl">
                    "Tính năng đang được phát triển! <br /> Mời quý khách quay trở lại sau!"
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 mx-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 border border-white/30 hover:border-white/50"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Quay về trang chủ</span>
                </button>
            </div>
        </div>
    );
};
