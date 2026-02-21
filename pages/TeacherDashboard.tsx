import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoldButton } from '../components/GoldButton';
import {
    GraduationCap, BookOpen, Users, DollarSign, Plus, Calendar,
    Clock, MapPin, CheckCircle, XCircle, AlertCircle, Upload, Save, Edit2,
    Camera, Video, FileImage
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import teacherService, { TeacherProfile, Course, TeacherStats } from '../lib/teacherService';
import uploadService from '../lib/uploadService';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { CourseCard } from '../components/learn/CourseCard';

export const TeacherDashboard: React.FC = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<TeacherProfile | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Profile form state
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        specializations: [] as string[],
        years_experience: 0,
        bio: '',
        teach_online: true,
        teach_offline: false,
        locations: [] as string[],
        price_online: 0,
        price_offline: 0,
        bundle_8_discount: '10',
        bundle_12_discount: '15',
        allow_trial_lesson: true,
        id_number: '',
        bank_name: '',
        bank_account: '',
        account_holder: '',
        certificates_description: '',
    });
    const [specializationInput, setSpecializationInput] = useState('');
    const [locationInput, setLocationInput] = useState('');

    /**
     * Parse a value that might be a JS array or a PostgreSQL array string.
     * PG returns arrays as `{"a","b"}` strings when fetched via REST in some cases.
     * This ensures we always get a proper JS string[].
     */
    const parseArrayField = (val: any): string[] => {
        if (Array.isArray(val)) return val as string[];
        if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
            const inner = val.slice(1, -1);
            if (!inner) return [];
            // Split by comma, but respect quoted values
            return inner.split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
        }
        return [];
    };

    // File upload state
    const [avatarUrl, setAvatarUrl] = useState('');
    const [videoDemoUrl, setVideoDemoUrl] = useState('');
    const [certificateUrls, setCertificateUrls] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    // Tabs state
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students'>('overview');

    // Course form state
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        price: 0,
        duration_weeks: 4,
        sessions_per_week: 2,
        max_students: 10,
        start_date: '',
        schedule: [] as { day_of_week: number; time: string }[],
        is_online: true,
        location: '',
    });

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || !user || user.role !== 'teacher') {
            navigate('/');
            return;
        }

        loadData();
    }, [authLoading, isAuthenticated, user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const profileData = await teacherService.getMyProfile();
            setProfile(profileData);

            if (profileData?.verification_status === 'approved') {
                const [coursesData, statsData] = await Promise.all([
                    teacherService.getMyCourses(),
                    teacherService.getStats(),
                ]);
                setCourses(coursesData);
                setStats(statsData);
            } else if (profileData) {
                // Pre-fill form with existing data
                setProfileForm({
                    full_name: profileData.full_name || '',
                    specializations: parseArrayField(profileData.specializations),
                    years_experience: profileData.years_experience || 0,
                    bio: profileData.bio || '',
                    teach_online: profileData.teach_online ?? true,
                    teach_offline: profileData.teach_offline ?? false,
                    locations: parseArrayField(profileData.locations),
                    price_online: profileData.price_online || 0,
                    price_offline: profileData.price_offline || 0,
                    bundle_8_discount: profileData.bundle_8_discount || '10',
                    bundle_12_discount: profileData.bundle_12_discount || '15',
                    allow_trial_lesson: profileData.allow_trial_lesson ?? true,
                    id_number: profileData.id_number || '',
                    bank_name: profileData.bank_name || '',
                    bank_account: profileData.bank_account || '',
                    account_holder: profileData.account_holder || '',
                    certificates_description: profileData.certificates_description || '',
                });
                setAvatarUrl(profileData.avatar_url || '');
                setVideoDemoUrl(profileData.video_demo_url || '');
                setCertificateUrls(parseArrayField(profileData.certificate_urls));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitProfile = async () => {
        try {
            setError('');
            setSuccess('');

            // Debug logging
            console.log('🔍 Profile form submission:', {
                full_name: profileForm.full_name,
                full_name_length: profileForm.full_name?.length,
                specializations: profileForm.specializations,
                specializations_length: profileForm.specializations?.length,
                bio: profileForm.bio,
                bio_length: profileForm.bio?.length,
                years_experience: profileForm.years_experience
            });

            // Validation with trim
            const fullName = profileForm.full_name?.trim();
            const bio = profileForm.bio?.trim();

            if (!fullName || fullName.length === 0) {
                setError('Vui lòng nhập họ và tên');
                return;
            }

            if (!profileForm.specializations || profileForm.specializations.length === 0) {
                setError('Vui lòng thêm ít nhất một chuyên môn');
                return;
            }

            if (!bio || bio.length === 0) {
                setError('Vui lòng nhập giới thiệu bản thân');
                return;
            }

            if (!profileForm.years_experience || profileForm.years_experience < 0) {
                setError('Vui lòng nhập số năm kinh nghiệm hợp lệ');
                return;
            }

            setLoading(true);
            const result = await teacherService.submitProfile({
                ...profileForm,
                full_name: fullName,
                bio: bio,
                avatar_url: avatarUrl || undefined,
                video_demo_url: videoDemoUrl || undefined,
                certificate_urls: certificateUrls.length > 0 ? certificateUrls : undefined,
            });
            setSuccess(result.message);
            setShowProfileForm(false);
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishCourse = async (courseId: string) => {
        try {
            setError('');
            setSuccess('');
            setLoading(true);
            const result = await teacherService.publishCourse(courseId);
            setSuccess(result.message);
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        try {
            setError('');
            setSuccess('');

            if (!courseForm.title || !courseForm.start_date || courseForm.schedule.length === 0) {
                setError('Vui lòng điền tiêu đề, ngày khai giảng và thêm ít nhất một lịch học');
                return;
            }

            setLoading(true);
            const result = await teacherService.createCourse(courseForm);
            setSuccess(result.message);
            setShowCourseModal(false);
            setCourseForm({
                title: '',
                description: '',
                price: 0,
                duration_weeks: 4,
                sessions_per_week: 2,
                max_students: 10,
                start_date: '',
                schedule: [],
                is_online: true,
                location: '',
            });
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addSpecialization = () => {
        if (specializationInput.trim() && !profileForm.specializations.includes(specializationInput.trim())) {
            setProfileForm({
                ...profileForm,
                specializations: [...profileForm.specializations, specializationInput.trim()]
            });
            setSpecializationInput('');
        }
    };

    const removeSpecialization = (spec: string) => {
        setProfileForm({
            ...profileForm,
            specializations: profileForm.specializations.filter(s => s !== spec)
        });
    };

    const addLocation = () => {
        if (locationInput.trim() && !profileForm.locations.includes(locationInput.trim())) {
            setProfileForm({
                ...profileForm,
                locations: [...profileForm.locations, locationInput.trim()]
            });
            setLocationInput('');
        }
    };

    const removeLocation = (loc: string) => {
        setProfileForm({
            ...profileForm,
            locations: profileForm.locations.filter(l => l !== loc)
        });
    };

    // ─── File Upload Handlers ────────────────────────────────────────────

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setError('');
            setUploadingField('avatar');
            setUploadProgress(prev => ({ ...prev, avatar: 0 }));
            const publicUrl = await uploadService.uploadAvatar(file, (p) => {
                setUploadProgress(prev => ({ ...prev, avatar: p }));
            });
            setAvatarUrl(publicUrl);
            setSuccess('Upload ảnh đại diện thành công!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadingField(null);
            setUploadProgress(prev => ({ ...prev, avatar: 0 }));
            e.target.value = '';
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setError('');
            setUploadingField('video');
            setUploadProgress(prev => ({ ...prev, video: 0 }));
            const publicUrl = await uploadService.uploadCourseVideo(file, (p) => {
                setUploadProgress(prev => ({ ...prev, video: p }));
            });
            setVideoDemoUrl(publicUrl);
            setSuccess('Upload video demo thành công!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadingField(null);
            setUploadProgress(prev => ({ ...prev, video: 0 }));
            e.target.value = '';
        }
    };

    const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setError('');
            setUploadingField('cert');
            setUploadProgress(prev => ({ ...prev, cert: 0 }));
            const publicUrl = await uploadService.uploadCertificate(file, (p) => {
                setUploadProgress(prev => ({ ...prev, cert: p }));
            });
            setCertificateUrls(prev => [...prev, publicUrl]);
            setSuccess('Upload chứng chỉ thành công!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadingField(null);
            setUploadProgress(prev => ({ ...prev, cert: 0 }));
            e.target.value = '';
        }
    };

    const removeCertificateUrl = (index: number) => {
        setCertificateUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">Đang tải...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user || user.role !== 'teacher') return null;

    // Render: Not submitted or rejected
    const shouldShowProfileForm = !profile || profile.verification_status === 'rejected';

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <GraduationCap className="w-8 h-8 text-primary" />
                            Teacher Dashboard
                        </h1>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-lg">
                            {success}
                        </div>
                    )}

                    {loading && !profile ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : shouldShowProfileForm ? (
                        /* Profile Submission Form */
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                            {profile?.verification_status === 'rejected' ? (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">Hồ sơ bị từ chối</h3>
                                    <p className="text-red-700 dark:text-red-400">
                                        Lý do: {profile.rejected_reason || 'Không có lý do cụ thể'}
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                        Vui lòng chỉnh sửa và gửi lại hồ sơ.
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
                                        🎓 Chào mừng đến với cộng đồng giáo viên Xpiano!
                                    </h2>
                                    <p className="text-blue-800 dark:text-blue-300 mb-3">
                                        Để bắt đầu dạy học và kiếm thu nhập, vui lòng hoàn thành hồ sơ giáo viên của bạn.
                                        Admin sẽ xem xét và phê duyệt trong vòng 24-48 giờ.
                                    </p>
                                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 space-y-1 text-sm">
                                        <li>Điền đầy đủ thông tin chuyên môn và kinh nghiệm</li>
                                        <li>Tải lên chứng chỉ và video giới thiệu (nếu có)</li>
                                        <li>Cung cấp thông tin thanh toán để nhận thu nhập</li>
                                    </ul>
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Thông tin hồ sơ giáo viên
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.full_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>

                                {/* Years Experience */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Số năm kinh nghiệm <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={profileForm.years_experience}
                                        onChange={(e) => setProfileForm({ ...profileForm, years_experience: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        min="0"
                                    />
                                </div>

                                {/* Specializations */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Chuyên môn <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={specializationInput}
                                            onChange={(e) => setSpecializationInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            placeholder="VD: Piano, Lý thuyết nhạc..."
                                        />
                                        <GoldButton
                                            type="button"
                                            onClick={addSpecialization}
                                            className="px-4 py-2 rounded-lg"
                                        >
                                            Thêm
                                        </GoldButton>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {profileForm.specializations.map((spec) => (
                                            <span
                                                key={spec}
                                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {spec}
                                                <GoldButton onClick={() => removeSpecialization(spec)} className="!p-0.5 !bg-transparent !bg-none hover:text-red-600">
                                                    ×
                                                </GoldButton>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Giới thiệu bản thân <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={profileForm.bio}
                                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        rows={4}
                                        placeholder="Mô tả kinh nghiệm, phong cách dạy học của bạn..."
                                    />
                                </div>

                                {/* Teaching Options */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Hình thức dạy học
                                    </label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={profileForm.teach_online}
                                                onChange={(e) => setProfileForm({ ...profileForm, teach_online: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">Dạy online</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={profileForm.teach_offline}
                                                onChange={(e) => setProfileForm({ ...profileForm, teach_offline: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">Dạy offline</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={profileForm.allow_trial_lesson}
                                                onChange={(e) => setProfileForm({ ...profileForm, allow_trial_lesson: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">Cho phép học thử</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Prices */}
                                {profileForm.teach_online && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Giá dạy online (VNĐ/buổi)
                                        </label>
                                        <input
                                            type="number"
                                            value={profileForm.price_online}
                                            onChange={(e) => setProfileForm({ ...profileForm, price_online: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            min="0"
                                        />
                                    </div>
                                )}

                                {profileForm.teach_offline && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Giá dạy offline (VNĐ/buổi)
                                        </label>
                                        <input
                                            type="number"
                                            value={profileForm.price_offline}
                                            onChange={(e) => setProfileForm({ ...profileForm, price_offline: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            min="0"
                                        />
                                    </div>
                                )}

                                {/* Locations (if offline) */}
                                {profileForm.teach_offline && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Khu vực dạy offline
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={locationInput}
                                                onChange={(e) => setLocationInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                                                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                placeholder="VD: Cầu Giấy, Ba Đình..."
                                            />
                                            <GoldButton
                                                type="button"
                                                onClick={addLocation}
                                                className="px-4 py-2 rounded-lg"
                                            >
                                                Thêm
                                            </GoldButton>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profileForm.locations.map((loc) => (
                                                <span
                                                    key={loc}
                                                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm flex items-center gap-2"
                                                >
                                                    {loc}
                                                    <GoldButton onClick={() => removeLocation(loc)} className="!p-0.5 !bg-transparent !bg-none hover:text-red-600">
                                                        ×
                                                    </GoldButton>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Discounts */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Giảm giá gói 8 buổi (%)
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.bundle_8_discount}
                                        onChange={(e) => setProfileForm({ ...profileForm, bundle_8_discount: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Giảm giá gói 12 buổi (%)
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.bundle_12_discount}
                                        onChange={(e) => setProfileForm({ ...profileForm, bundle_12_discount: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* ID Number */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Số CMND/CCCD
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.id_number}
                                        onChange={(e) => setProfileForm({ ...profileForm, id_number: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Bank Info */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Ngân hàng
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.bank_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, bank_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="VD: Vietcombank"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Số tài khoản
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.bank_account}
                                        onChange={(e) => setProfileForm({ ...profileForm, bank_account: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tên chủ tài khoản
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.account_holder}
                                        onChange={(e) => setProfileForm({ ...profileForm, account_holder: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Certificates */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Mô tả chứng chỉ/bằng cấp
                                    </label>
                                    <textarea
                                        value={profileForm.certificates_description}
                                        onChange={(e) => setProfileForm({ ...profileForm, certificates_description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        rows={3}
                                        placeholder="VD: Tốt nghiệp xuất sắc Học viện Âm nhạc Quốc gia Việt Nam..."
                                    />
                                </div>

                                {/* Certificate Images Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        <FileImage className="w-4 h-4 inline mr-1" />
                                        Ảnh chứng chỉ
                                    </label>
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {certificateUrls.map((url, i) => (
                                            <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                                                <img src={url} alt={`Cert ${i + 1}`} className="w-full h-full object-cover" />
                                                <GoldButton
                                                    type="button"
                                                    onClick={() => removeCertificateUrl(i)}
                                                    className="absolute top-1 right-1 w-5 h-5 !p-0 !bg-red-500 !bg-none text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </GoldButton>
                                            </div>
                                        ))}
                                        <label className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                            {uploadingField === 'cert' ? (
                                                <span className="text-xs font-bold text-primary">{uploadProgress.cert || 0}%</span>
                                            ) : (
                                                <>
                                                    <Plus className="w-6 h-6 text-slate-400" />
                                                    <span className="text-xs text-slate-400 mt-1">Thêm ảnh</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={handleCertificateUpload}
                                                className="hidden"
                                                disabled={uploadingField === 'cert'}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-500">JPG, PNG, WEBP (tối đa 5MB mỗi ảnh)</p>
                                </div>

                                {/* Avatar Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        <Camera className="w-4 h-4 inline mr-1" />
                                        Ảnh đại diện giáo viên
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative group w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-slate-400" />
                                            )}
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
                                                {uploadingField === 'avatar' ? (
                                                    <span className="text-white text-xs font-bold">{uploadProgress.avatar || 0}%</span>
                                                ) : (
                                                    <Camera className="w-5 h-5 text-white" />
                                                )}
                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.webp"
                                                    onChange={handleAvatarUpload}
                                                    className="hidden"
                                                    disabled={uploadingField === 'avatar'}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500">JPG, PNG, WEBP (tối đa 5MB)</p>
                                    </div>
                                </div>

                                {/* Video Demo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        <Video className="w-4 h-4 inline mr-1" />
                                        Video giới thiệu dạy học
                                    </label>
                                    {videoDemoUrl ? (
                                        <div className="space-y-2">
                                            <video src={videoDemoUrl} controls className="w-full max-h-40 rounded-lg bg-black" />
                                            <GoldButton
                                                type="button"
                                                onClick={() => setVideoDemoUrl('')}
                                                className="text-xs !bg-transparent !bg-none text-red-500 hover:text-red-700"
                                            >
                                                Xóa video
                                            </GoldButton>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                            {uploadingField === 'video' ? (
                                                <div className="text-center">
                                                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${uploadProgress.video || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-primary font-bold">{uploadProgress.video || 0}%</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Video className="w-8 h-8 text-slate-400 mb-1" />
                                                    <span className="text-sm text-slate-500">Chọn video</span>
                                                    <span className="text-xs text-slate-400">MP4, MOV (tối đa 50MB)</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept=".mp4,.mov"
                                                onChange={handleVideoUpload}
                                                className="hidden"
                                                disabled={uploadingField === 'video'}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-4">
                                <GoldButton
                                    onClick={handleSubmitProfile}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 rounded-lg disabled:opacity-50 font-semibold"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? 'Đang gửi...' : 'Gửi hồ sơ'}
                                </GoldButton>
                            </div>
                        </div>
                    ) : profile?.verification_status === 'pending' ? (
                        /* Pending Approval */
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center">
                            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                Hồ sơ đang chờ phê duyệt
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Admin đang xem xét hồ sơ của bạn. Quá trình này thường mất 24-48 giờ.
                            </p>
                            <GoldButton
                                onClick={() => setShowProfileForm(true)}
                                className="px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
                            >
                                <Edit2 className="w-4 h-4" />
                                Chỉnh sửa hồ sơ
                            </GoldButton>
                        </div>
                    ) : (
                        /* Approved - Show Dashboard */
                        <div className="space-y-6">
                            {/* Navigation Tabs */}
                            <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 mb-6 gap-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'overview'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Tổng quan
                                </button>
                                <button
                                    onClick={() => setActiveTab('courses')}
                                    className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'courses'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Quản lý Khóa học
                                </button>
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'students'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Quản lý Học viên
                                </button>
                            </div>

                            {/* Stats */}
                            {activeTab === 'overview' && stats && (
                                <>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">Tổng khóa học</p>
                                                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                                                        {stats.totalCourses}
                                                    </p>
                                                </div>
                                                <BookOpen className="w-12 h-12 text-blue-500" />
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">Tổng học viên</p>
                                                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                                                        {stats.totalStudents}
                                                    </p>
                                                </div>
                                                <Users className="w-12 h-12 text-green-500" />
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">Tổng doanh thu</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                                                    </p>
                                                </div>
                                                <DollarSign className="w-12 h-12 text-primary" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revenue & Students Chart */}
                                    {stats.chartData && stats.chartData.length > 0 && (
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mt-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Biểu đồ hoạt động</h3>
                                            <div className="h-[350px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <ComposedChart data={stats.chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                                        <YAxis
                                                            yAxisId="left"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${value / 1000}k`}
                                                        />
                                                        <YAxis
                                                            yAxisId="right"
                                                            orientation="right"
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />
                                                        <RechartsTooltip
                                                            formatter={(value: number, name: string) => {
                                                                if (name === 'Học viên tham gia') return [value, name];
                                                                return [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), name];
                                                            }}
                                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                                        />
                                                        <Legend />
                                                        <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Doanh thu (VNĐ)" />
                                                        <Line yAxisId="right" type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} name="Học viên tham gia" />
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Courses */}
                            {activeTab === 'courses' && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            Khóa học của tôi
                                        </h2>
                                        <GoldButton
                                            onClick={() => setShowCourseModal(true)}
                                            className="flex items-center gap-2 px-6 py-2 rounded-lg"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Tạo khóa học mới
                                        </GoldButton>
                                    </div>

                                    {courses.length === 0 ? (
                                        <div className="text-center py-12">
                                            <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {courses.map((course) => (
                                                <CourseCard
                                                    key={course.id}
                                                    course={course}
                                                    showTeacher={false}
                                                    badges={
                                                        <>
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${course.is_online
                                                                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/30'
                                                                : 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                                                                }`}>
                                                                {course.is_online ? 'Online' : 'Offline'}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-white/90 text-slate-800 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                                {course.status === 'draft' ? 'Bản nháp' : course.status === 'published' ? 'Đang mở bán' : course.status === 'completed' ? 'Đã kết thúc' : course.status}
                                                            </span>
                                                        </>
                                                    }
                                                    action={
                                                        course.status === 'draft' ? (
                                                            <GoldButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePublishCourse(course.id);
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-semibold ml-auto"
                                                            >
                                                                Xuất bản
                                                            </GoldButton>
                                                        ) : <div />
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Students */}
                            {activeTab === 'students' && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                        Học viên của tôi
                                    </h2>
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Tính năng quản lý học viên sẽ sớm ra mắt!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main >

            {/* Create Course Modal */}
            {
                showCourseModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                Tạo khóa học mới
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tên khóa học <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={courseForm.title}
                                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="VD: Piano cơ bản cho người mới bắt đầu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Mô tả <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={courseForm.description}
                                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        rows={4}
                                        placeholder="Mô tả chi tiết về khóa học..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Giá (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={courseForm.price}
                                            onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Thời lượng (tuần)
                                        </label>
                                        <input
                                            type="number"
                                            value={courseForm.duration_weeks}
                                            onChange={(e) => setCourseForm({ ...courseForm, duration_weeks: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Số buổi/tuần
                                        </label>
                                        <input
                                            type="number"
                                            value={courseForm.sessions_per_week}
                                            onChange={(e) => setCourseForm({ ...courseForm, sessions_per_week: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Số học viên tối đa
                                        </label>
                                        <input
                                            type="number"
                                            value={courseForm.max_students}
                                            onChange={(e) => setCourseForm({ ...courseForm, max_students: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Ngày bắt đầu
                                        </label>
                                        <input
                                            type="date"
                                            value={courseForm.start_date}
                                            onChange={(e) => setCourseForm({ ...courseForm, start_date: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                    </div>

                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Lịch học trong tuần <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            id="scheduleDay"
                                            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            <option value="1">Thứ 2</option>
                                            <option value="2">Thứ 3</option>
                                            <option value="3">Thứ 4</option>
                                            <option value="4">Thứ 5</option>
                                            <option value="5">Thứ 6</option>
                                            <option value="6">Thứ 7</option>
                                            <option value="0">Chủ nhật</option>
                                        </select>
                                        <input
                                            type="time"
                                            id="scheduleTime"
                                            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                        <GoldButton
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const d = document.getElementById('scheduleDay') as HTMLSelectElement;
                                                const t = document.getElementById('scheduleTime') as HTMLInputElement;
                                                if (t.value) {
                                                    setCourseForm({
                                                        ...courseForm,
                                                        schedule: [...courseForm.schedule, { day_of_week: parseInt(d.value), time: t.value }]
                                                    });
                                                }
                                            }}
                                            className="px-4 py-2 rounded-lg"
                                        >
                                            Thêm
                                        </GoldButton>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {courseForm.schedule.map((sch, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][sch.day_of_week]} - {sch.time}
                                                <button
                                                    type="button"
                                                    onClick={() => setCourseForm({
                                                        ...courseForm,
                                                        schedule: courseForm.schedule.filter((_, idx) => idx !== i)
                                                    })}
                                                    className="font-bold hover:text-red-500"
                                                >×</button>
                                            </span>
                                        ))}
                                    </div>
                                    {courseForm.schedule.length === 0 && (
                                        <p className="text-sm text-red-500 mt-1">Vui lòng thêm ít nhất một lịch học</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Hình thức
                                    </label>
                                    <select
                                        value={courseForm.is_online ? 'online' : 'offline'}
                                        onChange={(e) => setCourseForm({ ...courseForm, is_online: e.target.value === 'online' })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="online">Online</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                            </div>

                            {!courseForm.is_online && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Địa điểm
                                    </label>
                                    <input
                                        type="text"
                                        value={courseForm.location}
                                        onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Địa chỉ cụ thể..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <GoldButton
                                    onClick={handleCreateCourse}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-lg disabled:opacity-50 font-semibold"
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo khóa học'}
                                </GoldButton>
                                <GoldButton
                                    onClick={() => setShowCourseModal(false)}
                                    className="px-6 py-3 !bg-slate-200 dark:!bg-slate-700 !bg-none text-slate-700 dark:text-slate-300 rounded-lg"
                                >
                                    Hủy
                                </GoldButton>
                            </div>
                        </div>
                    </div>
                )}
            <Footer />
        </div >
    );
};
