import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Calendar, Clock, Users, User, Play, Radio,
    Loader2, MapPin, CheckCircle, XCircle, BarChart3, Trash2,
    ShoppingCart, Lock
} from 'lucide-react';
import sessionService, { LiveSession, SessionParticipant, SessionAnalytics } from '../../lib/sessionService';
import { CourseCard } from './CourseCard';
import PaymentModal from '../PaymentModal';

interface SessionDetailProps {
    sessionId: string;
    currentUserId: string;
    userRole?: string;
    onBack: () => void;
    onJoinLive?: (sessionId: string) => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({ sessionId, currentUserId, userRole, onBack, onJoinLive }) => {
    const [session, setSession] = useState<LiveSession | null>(null);
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);
    const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const isOwner = session?.teacher_id === currentUserId;
    const isTeacher = userRole === 'teacher' || userRole === 'admin';

    useEffect(() => {
        loadSession();
    }, [sessionId]);

    const loadSession = async () => {
        setLoading(true);
        try {
            const [sessionRes, participantsRes] = await Promise.all([
                sessionService.getSession(sessionId),
                sessionService.getParticipants(sessionId),
            ]);

            if (sessionRes.success) setSession(sessionRes.data);
            if (participantsRes.success) setParticipants(participantsRes.data || []);

            // Load analytics for ended sessions
            if (sessionRes.data?.status === 'ended') {
                const analyticsRes = await sessionService.getSessionAnalytics(sessionId);
                if (analyticsRes.success) setAnalytics(analyticsRes.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        setActionLoading(true);
        setError('');
        try {
            const res = await sessionService.startSession(sessionId);
            if (res.success && onJoinLive) {
                onJoinLive(sessionId);
            } else {
                setError(res.message || 'Lỗi bắt đầu buổi học');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async () => {
        if (onJoinLive) onJoinLive(sessionId);
    };

    const handleCancel = async () => {
        if (!confirm('Bạn chắc chắn muốn hủy buổi học này?')) return;
        setActionLoading(true);
        try {
            const res = await sessionService.deleteSession(sessionId);
            if (res.success) {
                onBack();
            } else {
                setError(res.message || 'Lỗi hủy buổi học');
            }
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                <p className="text-sm text-slate-400">Đang tải...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="text-center py-20">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">Không tìm thấy buổi học</p>
                <button onClick={onBack} className="mt-3 text-amber-500 hover:underline text-sm">← Quay lại</button>
            </div>
        );
    }

    const dateStr = new Date(session.scheduled_at).toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = new Date(session.scheduled_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách
            </button>

            {/* Session Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                {/* Status Banner */}
                <div className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 ${session.status === 'live' ? 'bg-green-500 text-white' :
                    session.status === 'scheduled' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                        session.status === 'ended' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'
                    }`}>
                    {session.status === 'live' && <><Radio className="w-4 h-4 animate-pulse" /> Đang diễn ra</>}
                    {session.status === 'scheduled' && <><Calendar className="w-4 h-4" /> Sắp diễn ra</>}
                    {session.status === 'ended' && <><CheckCircle className="w-4 h-4" /> Đã kết thúc</>}
                    {session.status === 'cancelled' && <><XCircle className="w-4 h-4" /> Đã hủy</>}
                </div>

                <div className="p-6">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{session.title}</h1>
                    {session.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{session.description}</p>
                    )}

                    {/* Info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>{timeStr} • {session.duration_minutes}p</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Users className="w-4 h-4 text-amber-500" />
                            <span>{session.current_participants ?? participants.length}/{session.max_participants} người</span>
                        </div>
                        {session.teacher && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <User className="w-4 h-4 text-amber-500" />
                                <span>{session.teacher.full_name}</span>
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {(!isTeacher && session.course && session.is_enrolled === false) ? (
                            <div className="w-full mt-4">
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Khóa học yêu cầu đăng ký</h4>
                                        <p className="text-sm text-amber-700/80 dark:text-amber-500/80">
                                            Buổi học này thuộc về một khóa học cao cấp. Bạn cần đăng ký khóa học bên dưới để có thể tham gia vào lớp học trực tuyến.
                                        </p>
                                    </div>
                                </div>
                                <CourseCard
                                    course={session.course}
                                    showTeacher={false}
                                    action={
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Đăng ký ngay
                                        </button>
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                {session.status === 'live' && (
                                    <button
                                        onClick={handleJoin}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                        {isOwner ? 'Vào phòng dạy' : 'Tham gia học'}
                                    </button>
                                )}

                                {session.status === 'scheduled' && isOwner && (
                                    <>
                                        <button
                                            onClick={handleStart}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                            Bắt đầu buổi học
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-4 py-3 border border-red-200 dark:border-red-800 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Hủy
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Participants */}
            {participants.length > 0 && (
                <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-500" />
                        Người tham gia ({participants.length})
                    </h2>
                    <div className="space-y-3">
                        {participants.map(p => (
                            <div key={p.id} className="flex items-center gap-3">
                                {p.user?.avatar_url ? (
                                    <img src={p.user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                                        {p.user?.full_name?.[0] || '?'}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{p.user?.full_name || 'Ẩn danh'}</p>
                                    <p className="text-xs text-slate-400">{p.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${p.left_at ? 'bg-slate-300' : 'bg-green-400'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics (for ended sessions) */}
            {analytics && session.status === 'ended' && (
                <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-500" />
                        Thống kê buổi học
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-500">{analytics.total_participants}</p>
                            <p className="text-xs text-slate-500">Người tham gia</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-500">{analytics.total_duration_minutes}p</p>
                            <p className="text-xs text-slate-500">Tổng thời gian</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-violet-500">{Math.round(analytics.avg_engagement_score * 100)}%</p>
                            <p className="text-xs text-slate-500">Điểm tương tác</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal for unenrolled users */}
            {showPaymentModal && session.course && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    orderType="course"
                    courseId={session.course.id}
                    courseName={session.course.title}
                    totalPrice={session.course.price}
                    paymentMethodOnly='QR'
                    onSuccess={() => {
                        alert('Đăng ký khóa học thành công!');
                        setShowPaymentModal(false);
                        loadSession(); // reload specifically to update is_enrolled flag
                    }}
                />
            )}

            <div className="h-20 lg:h-0" />
        </div>
    );
};
