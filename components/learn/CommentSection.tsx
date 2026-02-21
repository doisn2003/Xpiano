import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import learnService, { Comment } from '../../lib/learnService';
import { UserProfileCard } from './UserProfileCard';
import { UserProfileModal } from './UserProfileModal';

interface CommentSectionProps {
    postId: string;
    commentsCount: number;
    currentUserId?: string;
    isOpen: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
    postId,
    commentsCount,
    currentUserId,
    isOpen,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && comments.length === 0) {
            loadComments();
        }
    }, [isOpen]);

    const loadComments = async (nextCursor?: string) => {
        setLoading(true);
        try {
            const res = await learnService.getComments(postId, nextCursor || undefined, 10);
            if (res.success) {
                setComments(prev => nextCursor ? [...prev, ...res.data] : res.data);
                setCursor(res.pagination?.next_cursor || null);
                setHasMore(res.pagination?.has_more || false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;
        setSending(true);
        try {
            const res = await learnService.createComment(postId, newComment.trim());
            if (res.success && res.data) {
                setComments(prev => [res.data, ...prev]);
                setNewComment('');
            }
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-3 animate-in slide-in-from-top-2 duration-200">
            {/* Comment Input */}
            {currentUserId && (
                <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || sending}
                        className="p-2.5 bg-primary text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            )}

            {/* Comments List */}
            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                {comments.length === 0 && !loading && (
                    <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                )}

                {/* Redesign comments to be simpler - not nested UserProfileCard */}
                {comments.length > 0 && (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <button
                                    onClick={() => setSelectedUserId(comment.author?.id || null)}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity"
                                >
                                    {comment.author?.avatar_url ? (
                                        <img src={comment.author.avatar_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span>{comment.author?.full_name?.charAt(0) || 'U'}</span>
                                    )}
                                </button>
                                <div className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-2.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            onClick={() => setSelectedUserId(comment.author?.id || null)}
                                            className="font-semibold text-sm text-slate-900 dark:text-white hover:text-primary transition-colors text-left"
                                        >
                                            {comment.author?.full_name || 'Người dùng'}
                                        </button>
                                        {comment.author?.role === 'teacher' && (
                                            <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium">
                                                🎹 GV
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                )}

                {hasMore && !loading && (
                    <button
                        onClick={() => loadComments(cursor || undefined)}
                        className="w-full text-center text-sm text-primary hover:text-cyan-700 font-medium py-2 transition-colors"
                    >
                        Xem thêm bình luận
                    </button>
                )}
            </div>
            {selectedUserId && (
                <UserProfileModal
                    userId={selectedUserId}
                    currentUserId={currentUserId}
                    isOpen={!!selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};
