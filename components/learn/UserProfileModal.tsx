import React, { useState, useEffect } from 'react';
import { X, MessageCircle, UserPlus, UserMinus, FileImage, Video, Award, Star, Loader2, User } from 'lucide-react';
import learnService from '../../lib/learnService';
import messageService from '../../lib/messageService';
import { useNavigate } from 'react-router-dom';

interface UserProfileModalProps {
    userId: string;
    currentUserId?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
    userId,
    currentUserId,
    isOpen,
    onClose
}) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [messagingLoading, setMessagingLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && userId) {
            loadProfile();
        }
    }, [isOpen, userId]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            // First fetch general user profile to determine role
            const userRes = await learnService.getUserPublicProfile(userId);

            if (userRes?.success && userRes.data) {
                if (userRes.data.isTeacher) {
                    // Fetch teacher specific info which includes base profile + logic
                    const teacherRes = await learnService.getTeacherPublicProfile(userId);
                    if (teacherRes?.success && teacherRes.data) {
                        const profileData = { ...teacherRes.data, isTeacher: true };
                        const coursesRes = await learnService.getTeacherCourses(userId);
                        if (coursesRes?.success) {
                            profileData.courses = coursesRes.data;
                        }
                        setProfile(profileData);
                        setIsFollowing(teacherRes.data.is_following);
                    } else {
                        // Fallback to basic profile if teacher profile not approved yet or missing
                        setProfile(userRes.data);
                        setIsFollowing(userRes.data.is_following);
                    }
                } else {
                    // Normal user
                    setProfile(userRes.data);
                    setIsFollowing(userRes.data.is_following);
                }
            } else {
                setProfile(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (followLoading || !currentUserId) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await learnService.unfollowUser(userId);
                setIsFollowing(false);
                if (profile?.stats) {
                    setProfile({ ...profile, stats: { ...profile.stats, followers_count: Math.max(0, profile.stats.followers_count - 1) } });
                }
            } else {
                await learnService.followUser(userId);
                setIsFollowing(true);
                if (profile?.stats) {
                    setProfile({ ...profile, stats: { ...profile.stats, followers_count: profile.stats.followers_count + 1 } });
                }
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handleMessage = async () => {
        if (messagingLoading || !currentUserId) return;
        setMessagingLoading(true);
        try {
            const res = await messageService.createConversation(userId);
            if (res.success && res.data) {
                onClose();
                // To actually open the chat, we'd need to emit an event or navigate.
                // Assuming we're already on /learn, this might just need to set the active chat via Context or state.
                // For now, we just close the modal. The user can find it in their list.
                window.dispatchEvent(new CustomEvent('open-conversation', { detail: res.data }));
            }
        } finally {
            setMessagingLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 fade-in-0 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Hồ sơ người dùng</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-6 overflow-y-auto no-scrollbar flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : profile ? (
                        <div className="space-y-8">
                            {/* Header Info */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-600 p-1 flex-shrink-0">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                        {profile.profile?.avatar_url ? (
                                            <img src={profile.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <User className="w-10 h-10 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {profile.profile?.full_name || 'Người dùng'}
                                        {profile.profile?.role === 'teacher' && (
                                            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                                GIÁO VIÊN
                                            </span>
                                        )}
                                    </h3>
                                    {profile.stats && (
                                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> {profile.stats.followers_count || 0} người theo dõi</span>
                                            {profile.isTeacher && <span>• {profile.stats.courses_count || 0} khóa học</span>}
                                            {profile.isTeacher && <span>• {profile.stats.total_students || 0} học viên</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            {currentUserId && currentUserId !== userId && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${isFollowing
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                                            : 'bg-primary text-white hover:bg-cyan-700'
                                            }`}
                                    >
                                        {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                        {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                                    </button>
                                    <button
                                        onClick={handleMessage}
                                        disabled={messagingLoading}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-500 text-white rounded-xl font-semibold hover:bg-violet-600 transition-colors"
                                    >
                                        {messagingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                                        Nhắn tin
                                    </button>
                                </div>
                            )}

                            {/* Teacher Extra Info */}
                            {profile.isTeacher && (
                                <div className="space-y-6">
                                    {profile.bio && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Giới thiệu</h4>
                                            <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                                                {profile.bio}
                                            </p>
                                        </div>
                                    )}

                                    {profile.certificates && profile.certificates.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                                                <Award className="w-4 h-4 text-amber-500" /> Bằng cấp & Chứng chỉ
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {profile.certificates.map((cert: any, i: number) => (
                                                    <div key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{cert.name}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{cert.issuer} • {cert.year}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {profile.certificate_urls && profile.certificate_urls.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                                                <FileImage className="w-4 h-4 text-cyan-500" /> Ảnh chứng chỉ
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {profile.certificate_urls.map((url: string, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer"
                                                        onClick={() => setSelectedImage(url)}
                                                    >
                                                        <img src={url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" alt="Certificate" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {profile.video_demo_url && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                                                <Video className="w-4 h-4 text-red-500" /> Video giới thiệu
                                            </h4>
                                            <video src={profile.video_demo_url} controls className="w-full rounded-xl bg-black max-h-64" />
                                        </div>
                                    )}

                                    {profile.courses && profile.courses.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                                                <Award className="w-4 h-4 text-emerald-500" /> Các khóa học
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {profile.courses.map((course: any) => (
                                                    <div key={course.id} className="group border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                                        <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                                            {course.thumbnail_url ? (
                                                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                    <Video className="w-8 h-8 opacity-50" />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                                                                {course.price > 0 ? `${course.price.toLocaleString()}đ` : 'Miễn phí'}
                                                            </div>
                                                        </div>
                                                        <div className="p-4 bg-white dark:bg-slate-800">
                                                            <h5 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                                                                {course.title}
                                                            </h5>
                                                            {course.level && (
                                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                                                    {course.level}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-10">
                            Không thể tải thông tin người dùng.
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Certificate Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-black/50 hover:bg-black rounded-full transition-all"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={selectedImage}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        alt="Zoomed Certificate"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};
