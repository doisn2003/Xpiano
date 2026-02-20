import React, { useState } from 'react';
import {
    X,
    Image as ImageIcon,
    Video,
    Globe,
    Users,
    Lock,
    Loader2,
    Sparkles,
    User,
} from 'lucide-react';
import learnService, { Post } from '../../lib/learnService';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (post: Post) => void;
    userName?: string;
    userAvatar?: string;
}

const visibilityOptions = [
    { value: 'public', label: 'Công khai', icon: Globe, desc: 'Mọi người đều thấy' },
    { value: 'followers', label: 'Người theo dõi', icon: Users, desc: 'Chỉ người theo dõi' },
    { value: 'private', label: 'Riêng tư', icon: Lock, desc: 'Chỉ mình bạn' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
    isOpen,
    onClose,
    onCreated,
    userName,
    userAvatar,
}) => {
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [postType, setPostType] = useState<'general' | 'course_review' | 'performance' | 'tip'>('general');
    const [loading, setLoading] = useState(false);
    const [showVisibility, setShowVisibility] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() || loading) return;
        setLoading(true);
        try {
            const res = await learnService.createPost({
                content: content.trim(),
                post_type: postType,
                visibility,
            });
            if (res.success && res.data) {
                onCreated(res.data);
                setContent('');
                setVisibility('public');
                setPostType('general');
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentVisibility = visibilityOptions.find(v => v.value === visibility) || visibilityOptions[0];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 fade-in-0 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Tạo bài viết
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 px-5 pt-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md">
                        {userAvatar ? (
                            <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-4 h-4" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{userName || 'Bạn'}</p>
                        {/* Visibility selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowVisibility(!showVisibility)}
                                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors mt-0.5"
                            >
                                <currentVisibility.icon className="w-3 h-3" />
                                <span>{currentVisibility.label}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showVisibility && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowVisibility(false)} />
                                    <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 py-1">
                                        {visibilityOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setVisibility(opt.value); setShowVisibility(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${visibility === opt.value
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <opt.icon className="w-4 h-4" />
                                                <div className="text-left">
                                                    <p className="font-medium">{opt.label}</p>
                                                    <p className="text-xs opacity-70">{opt.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 py-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Chia sẻ suy nghĩ, trải nghiệm học đàn của bạn..."
                        className="w-full min-h-[140px] bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm leading-relaxed resize-none focus:outline-none"
                        autoFocus
                    />
                </div>

                {/* Post Type Chips */}
                <div className="flex items-center gap-2 px-5 pb-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">Loại:</span>
                    {[
                        { value: 'general', label: 'Chung', icon: '📝' },
                        { value: 'course_review', label: 'Đánh giá', icon: '⭐' },
                        { value: 'performance', label: 'Trình diễn', icon: '🎹' },
                        { value: 'tip', label: 'Mẹo hay', icon: '💡' },
                    ].map(t => (
                        <button
                            key={t.value}
                            onClick={() => setPostType(t.value as any)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${postType === t.value
                                ? 'bg-primary/10 text-primary border border-primary/30'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-green-500 transition-colors">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 transition-colors">
                            <Video className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-cyan-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Đăng bài
                    </button>
                </div>
            </div>
        </div>
    );
};
