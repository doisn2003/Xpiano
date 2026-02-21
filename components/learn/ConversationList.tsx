import React, { useState, useEffect } from 'react';
import {
    Search,
    PlusCircle,
    User,
    Users,
    Loader2,
    MessageCircle,
} from 'lucide-react';
import messageService, { Conversation } from '../../lib/messageService';

interface ConversationListProps {
    activeConversationId?: string;
    onSelectConversation: (conv: Conversation) => void;
    onNewConversation: () => void;
}

const timeAgo = (dateStr: string): string => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins}p`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export const ConversationList: React.FC<ConversationListProps> = ({
    activeConversationId,
    onSelectConversation,
    onNewConversation,
}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const res = await messageService.getConversations();
            if (res.success) {
                setConversations(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const filtered = React.useMemo(() => {
        if (!search.trim()) return conversations;
        const lowerSearch = search.toLowerCase();
        return conversations.filter((c) => {
            const name = c.type === 'direct'
                ? c.other_user?.full_name || ''
                : c.name || '';
            const preview = c.last_message_preview || '';
            return name.toLowerCase().includes(lowerSearch) || preview.toLowerCase().includes(lowerSearch);
        });
    }, [conversations, search]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-violet-500" />
                        Tin nhắn
                    </h2>
                    <button
                        onClick={onNewConversation}
                        className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                        title="Tin nhắn mới"
                    >
                        <PlusCircle className="w-4 h-4" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm hội thoại..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <MessageCircle className="w-7 h-7 text-violet-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {search ? 'Không tìm thấy' : 'Chưa có hội thoại'}
                        </p>
                        {!search && (
                            <button
                                onClick={onNewConversation}
                                className="mt-3 text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                            >
                                Bắt đầu nhắn tin
                            </button>
                        )}
                    </div>
                ) : (
                    filtered.map((conv) => {
                        const isActive = conv.id === activeConversationId;
                        const displayName = conv.type === 'direct'
                            ? conv.other_user?.full_name || 'Người dùng'
                            : conv.name || 'Nhóm chat';
                        const avatarUrl = conv.type === 'direct' ? conv.other_user?.avatar_url : undefined;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${isActive
                                    ? 'bg-violet-50 dark:bg-violet-900/20 border-l-3 border-l-violet-500'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                {/* Avatar */}
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0 shadow-sm ${conv.type === 'group'
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                    : 'bg-gradient-to-br from-violet-500 to-purple-600'
                                    }`}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : conv.type === 'group' ? (
                                        <Users className="w-5 h-5" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm truncate ${conv.has_unread
                                            ? 'font-bold text-slate-800 dark:text-white'
                                            : 'font-medium text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {displayName}
                                        </p>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">
                                            {timeAgo(conv.last_message_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center mt-0.5">
                                        <p className={`text-xs truncate flex-1 ${conv.has_unread
                                            ? 'text-slate-600 dark:text-slate-300 font-medium'
                                            : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                            {conv.last_message_preview || 'Tin nhắn mới'}
                                        </p>
                                        {conv.has_unread && (
                                            <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
