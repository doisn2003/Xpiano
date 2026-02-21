import React, { useState, useEffect } from 'react';
import { X, Search, User, Loader2, MessageCircle } from 'lucide-react';
import messageService, { Conversation } from '../../lib/messageService';
import learnService from '../../lib/learnService';

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConversationCreated: (conv: Conversation) => void;
    currentUserId: string;
}

interface UserResult {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
    isOpen,
    onClose,
    onConversationCreated,
    currentUserId,
}) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim().length >= 2) {
                searchUsers();
            } else {
                setResults([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const searchUsers = async () => {
        setLoading(true);
        try {
            const res = await learnService.searchUsers(search.trim());
            if (res.success && res.data) {
                setResults(res.data.filter((u: UserResult) => u.id !== currentUserId));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (user: UserResult) => {
        setCreating(user.id);
        try {
            const res = await messageService.createConversation(user.id);
            if (res.success && res.data) {
                onConversationCreated(res.data);
                onClose();
            }
        } finally {
            setCreating(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 fade-in-0 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-violet-500" />
                        Tin nhắn mới
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, SĐT hoặc email..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto no-scrollbar px-2 pb-4">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                        </div>
                    ) : search.trim().length < 2 ? (
                        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-6">
                            Nhập ít nhất 2 ký tự để tìm kiếm
                        </p>
                    ) : results.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-6">
                            Không tìm thấy người dùng
                        </p>
                    ) : (
                        results.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleSelect(user)}
                                disabled={creating !== null}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0 shadow-sm">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} className="w-full h-full object-cover" />
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
                                {creating === user.id && (
                                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
