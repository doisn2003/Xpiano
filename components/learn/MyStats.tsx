import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Flame,
    Clock,
    Trophy,
    MessageCircle,
    TrendingUp,
    Lock,
    Loader2,
    Calendar,
    GraduationCap,
} from 'lucide-react';
import learnService, { LearningStats } from '../../lib/learnService';

interface MyStatsProps {
    currentUserId?: string;
}

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    gradient: string;
}> = ({ icon, label, value, subtitle, gradient }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md`}>
                {icon}
            </div>
        </div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
    </div>
);

export const MyStats: React.FC<MyStatsProps> = ({ currentUserId }) => {
    const [stats, setStats] = useState<LearningStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUserId) {
            loadStats();
        } else {
            setLoading(false);
        }
    }, [currentUserId]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await learnService.getMyStats();
            if (res.success && res.data) {
                setStats(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!currentUserId) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">Cần đăng nhập</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">Vui lòng đăng nhập để xem thống kê</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-slate-400 dark:text-slate-500">Đang tải thống kê...</p>
            </div>
        );
    }

    const s = stats || {
        total_sessions_attended: 0,
        total_learning_minutes: 0,
        total_chat_messages: 0,
        avg_engagement_score: 0,
        streak_days: 0,
        longest_streak: 0,
        last_session_at: undefined,
    };

    const hours = Math.floor(s.total_learning_minutes / 60);
    const mins = s.total_learning_minutes % 60;
    const timeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Thống kê học tập
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Theo dõi tiến trình học đàn của bạn
                </p>
            </div>

            {/* Streak Banner */}
            {s.streak_days > 0 && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-amber-500/25">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Flame className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{s.streak_days} ngày</p>
                            <p className="text-sm text-white/80">Streak liên tiếp • Kỷ lục: {s.longest_streak} ngày</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                    icon={<GraduationCap className="w-5 h-5" />}
                    label="Buổi học"
                    value={s.total_sessions_attended}
                    gradient="from-blue-500 to-cyan-500"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Thời gian học"
                    value={timeDisplay}
                    gradient="from-violet-500 to-purple-500"
                />
                <StatCard
                    icon={<MessageCircle className="w-5 h-5" />}
                    label="Tin nhắn"
                    value={s.total_chat_messages}
                    gradient="from-pink-500 to-rose-500"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Điểm tương tác"
                    value={`${Math.round(s.avg_engagement_score * 100)}%`}
                    gradient="from-emerald-500 to-teal-500"
                />
                <StatCard
                    icon={<Trophy className="w-5 h-5" />}
                    label="Streak dài nhất"
                    value={`${s.longest_streak} ngày`}
                    gradient="from-amber-500 to-orange-500"
                />
                <StatCard
                    icon={<Calendar className="w-5 h-5" />}
                    label="Buổi gần nhất"
                    value={s.last_session_at ? new Date(s.last_session_at).toLocaleDateString('vi-VN') : 'Chưa có'}
                    gradient="from-slate-500 to-slate-600"
                />
            </div>

            {/* Tips */}
            {s.total_sessions_attended === 0 && (
                <div className="bg-gradient-to-br from-primary/10 to-cyan-500/10 dark:from-primary/20 dark:to-cyan-500/20 rounded-2xl border border-primary/10 dark:border-primary/20 p-6 text-center">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                        🎹 Bắt đầu hành trình
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Tham gia lớp học đầu tiên để bắt đầu theo dõi tiến trình học tập!
                    </p>
                </div>
            )}

            {/* Bottom padding for mobile nav */}
            <div className="h-20 lg:h-0" />
        </div>
    );
};

// Need GraduationCap in StatCard import above
