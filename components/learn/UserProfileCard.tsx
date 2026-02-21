import React, { useState } from 'react';
import { User, UserPlus, UserCheck } from 'lucide-react';
import learnService, { PostAuthor } from '../../lib/learnService';

interface UserProfileCardProps {
    user: PostAuthor & {
        followers_count?: number;
        following_count?: number;
        is_following?: boolean;
        bio?: string;
    };
    currentUserId?: string;
    compact?: boolean;
    onFollowChange?: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
    user,
    currentUserId,
    compact = false,
    onFollowChange,
}) => {
    const [isFollowing, setIsFollowing] = useState(user.is_following || false);
    const [loading, setLoading] = useState(false);

    const isSelf = currentUserId === user.id;

    const handleToggleFollow = async () => {
        if (isSelf || loading) return;
        setLoading(true);
        try {
            if (isFollowing) {
                await learnService.unfollowUser(user.id);
                setIsFollowing(false);
            } else {
                await learnService.followUser(user.id);
                setIsFollowing(true);
            }
            onFollowChange?.();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0 shadow-sm">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-4 h-4" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.full_name}</p>
                    {user.role === 'teacher' && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">🎹 Giáo viên</span>
                    )}
                </div>
                {!isSelf && (
                    <button
                        onClick={handleToggleFollow}
                        disabled={loading}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isFollowing
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30'
                                : 'bg-primary text-white shadow-sm hover:bg-cyan-700'
                            }`}
                    >
                        {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0 shadow-md">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white">{user.full_name}</h3>
                    {user.role === 'teacher' && (
                        <span className="inline-block text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full mt-1 font-medium">
                            🎹 Giáo viên
                        </span>
                    )}
                    {user.bio && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{user.bio}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <span><strong className="text-slate-700 dark:text-slate-300">{user.followers_count || 0}</strong> người theo dõi</span>
                        <span><strong className="text-slate-700 dark:text-slate-300">{user.following_count || 0}</strong> đang theo dõi</span>
                    </div>
                </div>
            </div>
            {!isSelf && (
                <button
                    onClick={handleToggleFollow}
                    disabled={loading}
                    className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isFollowing
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30'
                            : 'bg-gradient-to-r from-primary to-cyan-600 text-white shadow-md shadow-primary/20 hover:shadow-lg'
                        }`}
                >
                    {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
            )}
        </div>
    );
};
