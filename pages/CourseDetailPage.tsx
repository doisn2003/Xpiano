import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import learnService from '../lib/learnService';
import { Loader2, BookOpen, Clock, Users, ArrowLeft, ShoppingCart, User, CheckCircle, Video, List, Calendar } from 'lucide-react';
import { GoldButton } from '../components/GoldButton';
import PaymentModal from '../components/PaymentModal';

export const CourseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadCourse(id);
        }
    }, [id]);

    const loadCourse = async (courseId: string) => {
        setLoading(true);
        try {
            const res = await learnService.getCourseDetails(courseId);
            if (res.success) {
                setCourse(res.data);
            } else {
                setError(res.message || 'Không tìm thấy khóa học');
            }
        } catch (err: any) {
            setError('Lỗi kết nối khi tải khóa học');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col font-body">
                <Header />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex flex-col font-body">
                <Header />
                <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy khóa học</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <GoldButton onClick={() => navigate('/learn')} className="px-6 py-2">
                        Quay lại trang học tập
                    </GoldButton>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-body bg-slate-50 dark:bg-slate-900">
            <Header />

            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-24">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Course Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Section of Course */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                            <div className="aspect-video relative bg-slate-100 dark:bg-slate-700">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <BookOpen className="w-16 h-16 opacity-50 mb-2" />
                                        <p>Ảnh bìa khóa học</p>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold tracking-wide">
                                    {course.is_online ? 'HỌC ONLINE' : 'HỌC OFFLINE'}
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                                    {course.title}
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                    {course.description}
                                </p>

                                <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Sĩ số khóa</p>
                                            <p className="font-bold text-slate-900 dark:text-white">Tối đa {course.max_students} hv</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Thời lượng</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{course.duration_weeks} tuần</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Khai giảng</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{new Date(course.start_date).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What to learn */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <List className="w-6 h-6 text-amber-500" />
                                Mục tiêu khóa học
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Placeholders for structured outcomes if available, fallback to bullet lists from description maybe */}
                                <div className="flex gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>Nắm vững kiến thức nhạc lý cơ bản</span>
                                </div>
                                <div className="flex gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>Thực hành kỹ thuật trên đàn thực tế</span>
                                </div>
                                <div className="flex gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>Lộ trình kèm cặp 1-1 sát sao bởi giáo viên</span>
                                </div>
                                <div className="flex gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>Cấp chứng nhận hoàn thành khóa học</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Checkout Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 sticky top-24">
                            <div className="text-center mb-6">
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mb-2">Giá ưu đãi</p>
                                <h2 className="text-4xl font-extrabold text-amber-500 mb-1">
                                    {course.price > 0 ? `${new Intl.NumberFormat('vi-VN').format(course.price)}₫` : 'Miễn phí'}
                                </h2>
                            </div>

                            <GoldButton
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full py-4 rounded-xl text-lg flex justify-center items-center gap-2 mb-4 hover:shadow-2xl hover:shadow-amber-500/20 transition-all hover:-translate-y-1"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Đăng ký ngay
                            </GoldButton>

                            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
                                Đảm bảo hoàn tiền trong 7 ngày nếu không hài lòng.
                            </p>

                            <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Thông tin Giáo viên</h4>
                                <div className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-3 rounded-xl transition-colors" onClick={() => {/* Open teacher modal or navigate */ }}>
                                    {course.teacher?.avatar_url ? (
                                        <img src={course.teacher.avatar_url} className="w-14 h-14 rounded-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-lg">
                                            {course.teacher?.full_name || 'Giáo Viên'}
                                        </p>
                                        <p className="text-sm text-amber-600 dark:text-amber-500">Giảng viên chuyên môn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    orderType="course"
                    courseId={course.id}
                    courseName={course.title}
                    totalPrice={course.price}
                    onSuccess={() => {
                        alert('Đăng ký khóa học thành công!');
                        setShowPaymentModal(false);
                    }}
                />
            )}
        </div>
    );
};
