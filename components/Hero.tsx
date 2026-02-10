import React from 'react';
import { Smartphone, Bot, ArrowRight, Heart, MessageCircle, Share2, Play, Eye, GraduationCap } from 'lucide-react';
import { GoldButton } from './GoldButton';

export const Hero: React.FC = () => {
  return (
    <section className="relative py-12 lg:py-20 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full filter blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">

          {/* Left Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-right">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Khám phá âm nhạc <br className="hidden lg:block" />
              theo cách <span className="text-primary">mới mẻ</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-10 text-base lg:text-xl max-w-xl mx-auto lg:ml-auto lg:mr-0">
              Xem video review chân thực, học đàn trực tuyến và tìm kiếm cây đàn mơ ước của bạn ngay hôm nay.
            </p>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl max-w-md mx-auto lg:ml-auto lg:mr-0">
              <p className="text-sm font-semibold text-primary dark:text-cyan-400 mb-4 text-center lg:text-right">
                Trải nghiệm trọn vẹn trên ứng dụng của chúng tôi!
              </p>
              <div className="flex flex-col gap-3">
                <GoldButton className="flex items-center justify-center lg:justify-end gap-3 w-full py-3 px-6 rounded-xl transition-all active:scale-95 group shadow-md border border-transparent dark:border-slate-200">
                  <div className="text-right flex flex-col items-center lg:items-end leading-none">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">Download on</span>
                    <span className="text-lg font-bold mt-1">App Store</span>
                  </div>
                  <Smartphone className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </GoldButton>
                <GoldButton className="flex items-center justify-center lg:justify-end gap-3 w-full py-3 px-6 rounded-xl transition-all active:scale-95 group shadow-md border border-transparent dark:border-slate-200">
                  <div className="text-right flex flex-col items-center lg:items-end leading-none">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">Get it on</span>
                    <span className="text-lg font-bold mt-1">Google Play</span>
                  </div>
                  <Bot className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </GoldButton>
              </div>
            </div>

            <div className="hidden lg:flex justify-end mt-10">
              <ArrowRight className="text-primary w-10 h-10 animate-bounce" />
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          {/* Modified: Wider width and slightly shorter aspect ratio as requested */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[420px] shadow-2xl rounded-[2.5rem] border-8 border-white dark:border-slate-700 overflow-hidden bg-black aspect-[9/15] group ring-1 ring-slate-900/5 dark:ring-white/10">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE7k02uOyr4ACAPewzvCAxvvE6yh4Qizn5dObqOP1-z1GHKmlmaY-oYb5ON73K7f70HLw0qZHS2uXVeqd9ZnbrlFZbSJO91Fha1nn470I8Ex6_kQo2Y9GYSRYlAgr9vvZhXCUIWEKcnI-iLfl9LYlBrBk1r5YeB_SxDymU06Z6IGgP_066cW_kQXpZ6pzQrsqH5WI4FmZPKD1ah3ke1N6qBecZfAtWjUbQS2OU7xJIk32rUSkQhyEPdq7p4NDFx2gYVQPGLibcdFpx"
                alt="Playing Piano"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />

              {/* Phone UI Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 flex flex-col justify-between p-5">
                <div className="flex justify-between items-start pt-4">
                  <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-white shadow-sm animate-pulse">
                    LIVE
                  </div>
                </div>

                {/* Interaction Sidebar */}
                <div className="absolute right-3 bottom-40 flex flex-col gap-5 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                      <Heart className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow-md">1.2K</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                      <MessageCircle className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow-md">345</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                      <Share2 className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow-md">89</span>
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="flex flex-col gap-4 pb-2">
                  <div className="text-white pr-16">
                    <h3 className="font-bold text-lg drop-shadow-md mb-1">@pianomaster</h3>
                    <p className="text-sm opacity-95 line-clamp-2 drop-shadow-md leading-relaxed">
                      Review đàn piano điện Casio mới nhất. Âm thanh cực đỉnh! #piano #music
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <GoldButton className="py-3 rounded-xl text-sm font-bold shadow-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" /> Xem đàn
                    </GoldButton>
                    <GoldButton className="py-3 rounded-xl text-sm font-bold shadow-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Học ngay
                    </GoldButton>
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center pl-1 animate-pulse border border-white/30">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
