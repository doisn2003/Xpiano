import React, { useState, useEffect, useCallback } from 'react';
import {
    GraduationCap, Lock, Plus, Loader2, Users, Clock, Calendar,
    Radio, CheckCircle, XCircle, Filter, ChevronRight, Play, RefreshCw, BookOpen, ShoppingCart
} from 'lucide-react';
import sessionService, { LiveSession } from '../../lib/sessionService';
import learnService from '../../lib/learnService';
import teacherService from '../../lib/teacherService';
import socketService from '../../lib/socketService';
import { CreateSessionModal } from './CreateSessionModal';
import { SessionDetail } from './SessionDetail';
import { CourseCard } from './CourseCard';
import PaymentModal from '../PaymentModal';

interface ClassroomHubProps {
    currentUserId?: string;
    userRole?: string;
    onJoinLive?: (sessionId: string) => void;
}

type StatusFilter = 'all' | 'my_schedule' | 'scheduled' | 'live' | 'ended';

const STATUS_BADGES: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    my_schedule: { label: 'Lịch của tôi', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Calendar className="w-3 h-3" /> },
    scheduled: { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <Calendar className="w-3 h-3" /> },
    live: { label: 'Đang live', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <Radio className="w-3 h-3" /> },
    ended: { label: 'Đã kết thúc', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="w-3 h-3" /> },
};

export const ClassroomHub: React.FC<ClassroomHubProps> = ({ currentUserId, userRole, onJoinLive }) => {
    const [activeTab, setActiveTab] = useState<'marketplace' | 'my-courses' | 'schedule'>('marketplace');
    const [courses, setCourses] = useState<any[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [enrolledLoading, setEnrolledLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState<string | undefined>();

    const isTeacher = userRole === 'teacher' || userRole === 'admin';

    const loadSessions = useCallback(async (reset = true) => {
        setLoading(true);
        try {
            const params: any = { limit: 20 };
            if (filter !== 'all' && filter !== 'my_schedule') params.status = filter;
            if (filter === 'my_schedule') {
                if (isTeacher && currentUserId) {
                    params.teacher_id = currentUserId;
                } else {
                    params.my_schedule = true;
                }
            }
            if (!reset && cursor) params.cursor = cursor;

            const res = await sessionService.getSessions(params);
            if (res.success) {
                const newData = res.data || [];
                setSessions(prev => reset ? newData : [...prev, ...newData]);
                setHasMore(!!res.has_more);
                if (newData.length > 0) {
                    setCursor(newData[newData.length - 1].scheduled_at);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [filter, cursor]);

    const loadCourses = useCallback(async () => {
        setCoursesLoading(true);
        try {
            const res = await learnService.getPublicCourses();
            if (res.success) {
                setCourses(res.data);
            }
        } finally {
            setCoursesLoading(false);
        }
    }, []);

    const loadEnrolled = useCallback(async () => {
        setEnrolledLoading(true);
        try {
            if (isTeacher) {
                const courses = await teacherService.getMyCourses();
                // Filter only 'published' and 'completed'
                const displayCourses = courses.filter((c: any) => c.status === 'published' || c.status === 'completed');
                setEnrolledCourses(displayCourses.map((c: any) => ({ id: c.id, course: c })));
            } else {
                const res = await learnService.getMyEnrolledCourses();
                if (res.success) {
                    setEnrolledCourses(res.data);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setEnrolledLoading(false);
        }
    }, [isTeacher]);

    useEffect(() => {
        if (currentUserId) {
            if (activeTab === 'schedule') {
                setCursor(undefined);
                loadSessions(true);
            } else if (activeTab === 'marketplace') {
                loadCourses();
            } else if (activeTab === 'my-courses') {
                loadEnrolled();
            }
        } else {
            setLoading(false);
            setCoursesLoading(false);
            setEnrolledLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId, filter, activeTab]);

    // Real-time updates via Socket.io
    useEffect(() => {
        if (!currentUserId) return;

        const handleSessionEnd = (data: { session_id: string }) => {
            setSessions(prev =>
                prev.map(s => s.id === data.session_id ? { ...s, status: 'ended' as const } : s)
            );
        };

        socketService.on('session_ended', handleSessionEnd);
        return () => { socketService.off('session_ended', handleSessionEnd); };
    }, [currentUserId]);

    const handleSessionCreated = (session: LiveSession) => {
        setSessions(prev => [session, ...prev]);
        setShowCreateModal(false);
    };

    if (!currentUserId) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">Cần đăng nhập</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">Vui lòng đăng nhập để xem lớp học</p>
            </div>
        );
    }

    // Show session detail view
    if (selectedSessionId) {
        return (
            <SessionDetail
                sessionId={selectedSessionId}
                currentUserId={currentUserId}
                userRole={userRole}
                onBack={() => setSelectedSessionId(null)}
                onJoinLive={onJoinLive}
            />
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-amber-500" />
                        Lớp học trực tuyến
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Tham gia lớp học piano với giáo viên chuyên nghiệp
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => activeTab === 'marketplace' ? loadCourses() : loadSessions(true)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        title="Làm mới"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    {isTeacher && activeTab === 'schedule' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tạo buổi học</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-6">
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'marketplace'
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <BookOpen className="w-4 h-4" /> Chợ Khóa Học
                </button>
                <button
                    onClick={() => setActiveTab('my-courses')}
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'my-courses'
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <GraduationCap className="w-4 h-4" /> Khóa Của Tôi
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'schedule'
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <Calendar className="w-4 h-4" /> Lịch Học
                </button>
            </div>

            {activeTab === 'marketplace' && (
                <div className="space-y-4">
                    {coursesLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">Chưa có khóa học nào</h3>
                            <p className="text-sm text-slate-500">Hiện tại chưa có khóa học nào đang mở bán.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {courses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    showTeacher={true}
                                    action={
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCourse(course);
                                                setShowPaymentModal(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            <ShoppingCart className="w-4 h-4" /> Đăng ký
                                        </button>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'my-courses' && (
                <div className="space-y-4">
                    {enrolledLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : enrolledCourses.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                                {isTeacher ? 'Chưa có khóa học nào đang mở bán' : 'Chưa tham gia khóa học nào'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {isTeacher ? 'Các khóa học đã Xuất bản trên bảng điều khiển sẽ xuất hiện ở đây.' : 'Hãy chuyển sang tab Chợ Khóa Học để tìm hiểu và đăng ký khóa học.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {enrolledCourses.map(enrollment => {
                                const course = enrollment.course;
                                if (!course) return null;
                                return (
                                    <CourseCard
                                        key={enrollment.id}
                                        course={course}
                                        showTeacher={!isTeacher}
                                        badges={isTeacher ? (
                                            <span className="px-2 py-0.5 bg-white/90 text-slate-800 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                {course.status === 'published' ? 'Đang mở bán' : course.status === 'completed' ? 'Đã kết thúc' : course.status}
                                            </span>
                                        ) : undefined}
                                        action={
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveTab('schedule');
                                                }}
                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-semibold transition-colors"
                                            >
                                                <Calendar className="w-4 h-4" /> Xem Lịch Học
                                            </button>
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'schedule' && (
                <>
                    {/* Status Filters */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {(['all', 'my_schedule', 'live', 'scheduled', 'ended'] as StatusFilter[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600'
                                    }`}
                            >
                                {f === 'all' && <Filter className="w-3.5 h-3.5" />}
                                {f === 'my_schedule' && <Calendar className="w-3.5 h-3.5" />}
                                {f === 'live' && <Radio className="w-3.5 h-3.5" />}
                                {f === 'scheduled' && <Clock className="w-3.5 h-3.5" />}
                                {f === 'ended' && <CheckCircle className="w-3.5 h-3.5" />}
                                {f === 'all' ? 'Tất cả' : STATUS_BADGES[f]?.label}
                            </button>
                        ))}
                    </div>

                    {/* Session List */}
                    {loading && sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                            <p className="text-sm text-slate-400 dark:text-slate-500">Đang tải lớp học...</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                <GraduationCap className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                                Chưa có buổi học nào
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {filter === 'my_schedule'
                                    ? isTeacher
                                        ? 'Bạn chưa tạo buổi học nào cho lịch của mình.'
                                        : 'Bạn chưa đăng ký khóa học nào hoặc các khóa học bạn tham gia chưa có lịch học.'
                                    : isTeacher
                                        ? 'Bấm "Tạo buổi học" để bắt đầu!'
                                        : 'Các buổi học sẽ hiển thị ở đây khi giáo viên tạo.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map(session => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    currentUserId={currentUserId}
                                    onSelect={() => setSelectedSessionId(session.id)}
                                    onJoinLive={onJoinLive}
                                />
                            ))}

                            {hasMore && (
                                <button
                                    onClick={() => loadSessions(false)}
                                    disabled={loading}
                                    className="w-full py-3 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-colors"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Tải thêm'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Create Session Modal */}
                    {showCreateModal && (
                        <CreateSessionModal
                            onClose={() => setShowCreateModal(false)}
                            onCreated={handleSessionCreated}
                        />
                    )}
                </>
            )}
            {/* Payment Modal moved outside of activeTab schedule */}
            {showPaymentModal && selectedCourse && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    orderType="course"
                    courseId={selectedCourse.id}
                    courseName={selectedCourse.title}
                    totalPrice={selectedCourse.price}
                    // Requesting to only show QR
                    paymentMethodOnly='QR'
                    onSuccess={() => {
                        alert('Đăng ký khóa học thành công!');
                        setShowPaymentModal(false);
                    }}
                />
            )}

            <div className="h-20 lg:h-0" />
        </div>
    );
};

// ============================================================================
// Session Card
// ============================================================================

const SessionCard: React.FC<{
    session: LiveSession;
    currentUserId: string;
    onSelect: () => void;
    onJoinLive?: (sessionId: string) => void;
}> = ({ session, currentUserId, onSelect, onJoinLive }) => {
    const badge = STATUS_BADGES[session.status] || STATUS_BADGES.scheduled;
    const isOwner = session.teacher_id === currentUserId;
    const date = new Date(session.scheduled_at);
    const isLive = session.status === 'live';

    const formatDate = (d: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) return 'Hôm nay';
        if (d.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onJoinLive) onJoinLive(session.id);
    };

    return (
        <div
            onClick={onSelect}
            className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 cursor-pointer
                transition-all hover:shadow-md hover:-translate-y-0.5 group
                ${isLive
                    ? 'border-green-300 dark:border-green-700 shadow-sm shadow-green-500/10'
                    : 'border-slate-100 dark:border-slate-700'
                }`}
        >
            <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${isLive
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                    {isLive ? (
                        <Radio className="w-6 h-6 animate-pulse" />
                    ) : (
                        <>
                            <span className="text-xs font-semibold leading-none">{formatDate(date)}</span>
                            <span className="text-lg font-bold leading-tight">
                                {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.icon} {badge.label}
                        </span>
                        {isOwner && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                Của bạn
                            </span>
                        )}
                    </div>

                    <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {session.title}
                    </h3>

                    {session.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {session.description}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                        {session.teacher && (
                            <span className="flex items-center gap-1">
                                {session.teacher.avatar_url ? (
                                    <img src={session.teacher.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-600">
                                        {session.teacher.full_name?.[0]}
                                    </div>
                                )}
                                {session.teacher.full_name}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.duration_minutes}p
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.current_participants ?? '?'}/{session.max_participants}
                        </span>
                    </div>
                </div>

                {/* Action */}
                <div className="shrink-0 flex items-center">
                    {isLive ? (
                        <button
                            onClick={handleAction}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                        >
                            <Play className="w-3.5 h-3.5" />
                            {isOwner ? 'Vào phòng' : 'Tham gia'}
                        </button>
                    ) : session.status === 'scheduled' && isOwner ? (
                        <button
                            onClick={handleAction}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all"
                        >
                            <Play className="w-3.5 h-3.5" />
                            Bắt đầu
                        </button>
                    ) : (
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
                    )}
                </div>
            </div>
        </div>
    );
};
