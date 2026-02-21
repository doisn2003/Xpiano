import React, { useState } from 'react';
import {
    Heart,
    MessageCircle,
    MoreHorizontal,
    Flag,
    Trash2,
    Clock,
    Globe,
    Lock,
    Users,
    User,
} from 'lucide-react';
import learnService, { Post } from '../../lib/learnService';
import { CommentSection } from './CommentSection';
import { UserProfileModal } from './UserProfileModal';

interface PostCardProps {
    post: Post;
    currentUserId?: string;
    onDelete?: (postId: string) => void;
}

const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
};

const VisibilityIcon: React.FC<{ visibility: string }> = ({ visibility }) => {
    switch (visibility) {
        case 'followers': return <Users className="w-3 h-3" />;
        case 'private': return <Lock className="w-3 h-3" />;
        default: return <Globe className="w-3 h-3" />;
    }
};

export const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onDelete }) => {
    const [liked, setLiked] = useState(post.is_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [commentsCount, setCommentsCount] = useState(post.comments_count);
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const isOwner = currentUserId === post.user_id;

    const handleLike = async () => {
        if (likeLoading || !currentUserId) return;
        setLikeLoading(true);
        try {
            if (liked) {
                await learnService.unlikePost(post.id);
                setLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
            } else {
                await learnService.likePost(post.id);
                setLiked(true);
                setLikesCount(prev => prev + 1);
            }
        } finally {
            setLikeLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isOwner) return;
        const res = await learnService.deletePost(post.id);
        if (res.success) {
            onDelete?.(post.id);
        }
        setShowMenu(false);
    };

    const handleReport = async () => {
        await learnService.reportContent({
            content_type: 'post',
            content_id: post.id,
            reason: 'inappropriate',
        });
        setShowMenu(false);
    };

    return (
        <article className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedUserId(post.author?.id || null)}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md flex-shrink-0 hover:opacity-90 transition-opacity"
                    >
                        {post.author?.avatar_url ? (
                            <img src={post.author.avatar_url} alt={post.author.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedUserId(post.author?.id || null)}
                                className="font-semibold text-slate-800 dark:text-white text-sm hover:text-primary transition-colors text-left"
                            >
                                {post.author?.full_name || 'Người dùng'}
                            </button>
                            {post.author?.role === 'teacher' && (
                                <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium">
                                    🎹 GV
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(post.created_at)}</span>
                            <span>·</span>
                            <VisibilityIcon visibility={post.visibility} />
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 py-1 animate-in fade-in-0 zoom-in-95 duration-150">
                                {isOwner ? (
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa bài viết
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReport}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Flag className="w-4 h-4" />
                                        Báo cáo
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-3">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
                <div className={`grid gap-0.5 ${post.media_urls.length === 1 ? 'grid-cols-1' : post.media_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {post.media_urls.slice(0, 4).map((url, idx) => (
                        <div key={idx} className="relative aspect-video bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            {post.post_type === 'video' ? (
                                <video src={url} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            )}
                            {idx === 3 && post.media_urls.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                                    +{post.media_urls.length - 4}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-50 dark:border-slate-700/50">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${liked
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-red-500'
                        }`}
                >
                    <Heart className={`w-[18px] h-[18px] transition-all ${liked ? 'fill-current scale-110' : ''}`} />
                    <span>{likesCount > 0 ? likesCount : ''}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${showComments
                        ? 'text-primary bg-primary/10 dark:bg-primary/20'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary'
                        }`}
                >
                    <MessageCircle className="w-[18px] h-[18px]" />
                    <span>{commentsCount > 0 ? commentsCount : ''}</span>
                </button>
            </div>

            {/* Comments */}
            <div className={showComments ? 'px-5 pb-4' : ''}>
                <CommentSection
                    postId={post.id}
                    commentsCount={commentsCount}
                    currentUserId={currentUserId}
                    isOpen={showComments}
                />
            </div>

            {selectedUserId && (
                <UserProfileModal
                    userId={selectedUserId}
                    currentUserId={currentUserId}
                    isOpen={!!selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </article>
    );
};
