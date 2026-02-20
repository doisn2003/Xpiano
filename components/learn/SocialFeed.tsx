import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Loader2, Music, TrendingUp, Sparkles } from 'lucide-react';
import learnService, { Post, PostAuthor } from '../../lib/learnService';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { UserProfileCard } from './UserProfileCard';

interface SocialFeedProps {
    currentUserId?: string;
    userName?: string;
    userAvatar?: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
    currentUserId,
    userName,
    userAvatar,
}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [teachers, setTeachers] = useState<PostAuthor[]>([]);

    useEffect(() => {
        loadFeed();
        loadTeachers();
    }, []);

    const loadFeed = async (nextCursor?: string) => {
        if (nextCursor) setLoadingMore(true);
        else setLoading(true);
        try {
            const res = await learnService.getFeed(nextCursor || undefined, 10);
            if (res.success) {
                setPosts(prev => nextCursor ? [...prev, ...res.data] : res.data);
                setCursor(res.pagination?.next_cursor || null);
                setHasMore(res.pagination?.has_more || false);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadTeachers = async () => {
        const res = await learnService.getTeachers();
        if (res.success && res.data) {
            setTeachers(res.data.slice(0, 5));
        }
    };

    const handlePostCreated = (newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const handleScroll = useCallback(() => {
        if (loadingMore || !hasMore) return;
        const scrolledToBottom =
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 500;
        if (scrolledToBottom && cursor) {
            loadFeed(cursor);
        }
    }, [loadingMore, hasMore, cursor]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Music className="w-6 h-6 text-primary" />
                        Bảng tin
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Khám phá và chia sẻ hành trình học đàn
                    </p>
                </div>
                {currentUserId && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-cyan-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Đăng bài</span>
                    </button>
                )}
            </div>

            <div className="flex gap-6">
                {/* Main Feed */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Quick Post Area */}
                    {currentUserId && (
                        <div
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md flex-shrink-0">
                                {userAvatar ? (
                                    <img src={userAvatar} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs">{userName?.charAt(0) || '?'}</span>
                                )}
                            </div>
                            <div className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-sm text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                                Bạn đang nghĩ gì về hành trình học đàn?
                            </div>
                            <Sparkles className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                        </div>
                    )}

                    {/* Posts */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                            <p className="text-sm text-slate-400 dark:text-slate-500">Đang tải bảng tin...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                                <Music className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                                Chưa có bài viết nào
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                Hãy là người đầu tiên chia sẻ trải nghiệm học đàn của bạn! 🎹
                            </p>
                            {currentUserId && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-primary to-cyan-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                                >
                                    <PlusCircle className="w-4 h-4 inline mr-2" />
                                    Tạo bài viết đầu tiên
                                </button>
                            )}
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUserId={currentUserId}
                                onDelete={handlePostDeleted}
                            />
                        ))
                    )}

                    {/* Load More */}
                    {loadingMore && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    )}

                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
                            🎵 Bạn đã xem hết bảng tin
                        </div>
                    )}

                    {/* Bottom padding for mobile nav */}
                    <div className="h-20 lg:h-0" />
                </div>

                {/* Right Sidebar - Teachers to Follow (Desktop only) */}
                <div className="hidden xl:block w-72 flex-shrink-0">
                    <div className="sticky top-20 space-y-4">
                        {/* Suggested Teachers */}
                        {teachers.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    Giáo viên nổi bật
                                </h3>
                                <div className="space-y-4">
                                    {teachers.map((teacher) => (
                                        <UserProfileCard
                                            key={teacher.id}
                                            user={teacher}
                                            currentUserId={currentUserId}
                                            compact
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Stats Link */}
                        <div className="bg-gradient-to-br from-primary/10 to-cyan-500/10 dark:from-primary/20 dark:to-cyan-500/20 rounded-2xl border border-primary/10 dark:border-primary/20 p-5">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-2">🎯 Mẹo hôm nay</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Luyện tập đều đặn 15 phút mỗi ngày hiệu quả hơn 2 giờ mỗi tuần. Hãy duy trì streak của bạn!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handlePostCreated}
                userName={userName}
                userAvatar={userAvatar}
            />
        </div>
    );
};
