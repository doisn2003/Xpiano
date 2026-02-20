import React from 'react';
import { MessageCircle, Lock } from 'lucide-react';

interface MessagingPanelProps {
    currentUserId?: string;
}

export const MessagingPanel: React.FC<MessagingPanelProps> = ({ currentUserId }) => {
    if (!currentUserId) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">Cần đăng nhập</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">Vui lòng đăng nhập để xem tin nhắn</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center shadow-sm">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-violet-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    Tin nhắn
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Tính năng nhắn tin trực tiếp đang được phát triển. Sắp ra mắt trong Phase B! 🚀
                </p>
                <div className="mt-4 inline-block px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded-full text-xs font-semibold">
                    🔧 Đang phát triển
                </div>
            </div>
        </div>
    );
};
