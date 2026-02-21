import React from 'react';
import {
    Home,
    MessageCircle,
    GraduationCap,
    BarChart3,
    Users,
    PlusCircle,
} from 'lucide-react';

export type LearnTab = 'feed' | 'messages' | 'classrooms' | 'stats';

interface LearnSidebarProps {
    activeTab: LearnTab;
    onTabChange: (tab: LearnTab) => void;
    userName?: string;
    userAvatar?: string;
    userRole?: string;
}

const tabs = [
    { id: 'feed' as LearnTab, label: 'Bảng tin', icon: Home, color: 'from-cyan-500 to-teal-500' },
    { id: 'messages' as LearnTab, label: 'Tin nhắn', icon: MessageCircle, color: 'from-violet-500 to-purple-500' },
    { id: 'classrooms' as LearnTab, label: 'Lớp học', icon: GraduationCap, color: 'from-amber-500 to-orange-500' },
    { id: 'stats' as LearnTab, label: 'Thống kê', icon: BarChart3, color: 'from-emerald-500 to-green-500' },
];

export const LearnSidebar: React.FC<LearnSidebarProps> = ({
    activeTab,
    onTabChange,
    userName,
    userAvatar,
    userRole,
}) => {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 min-h-[calc(100vh-64px)] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
                {/* User Profile Mini */}
                {userName && (
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md">
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{userName}</p>
                                {userRole && (
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 font-medium ${userRole === 'teacher'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                            : userRole === 'admin'
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                        {userRole === 'teacher' ? '🎹 Giáo viên' : userRole === 'admin' ? '⚡ Admin' : '🎵 Học viên'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isActive
                                        ? `bg-gradient-to-br ${tab.color} text-white shadow-md`
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:scale-105'
                                    }`}>
                                    <Icon className="w-[18px] h-[18px]" />
                                </div>
                                <span>{tab.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Action */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => onTabChange('feed')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-cyan-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Đăng bài viết
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex justify-around items-center px-2 py-1.5">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${isActive
                                        ? 'text-primary'
                                        : 'text-slate-400 dark:text-slate-500'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-all ${isActive ? `bg-gradient-to-br ${tab.color} text-white shadow-md scale-110` : ''}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};
