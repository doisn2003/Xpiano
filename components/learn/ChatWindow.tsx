import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowLeft,
    Send,
    Loader2,
    User,
    Users,
    Trash2,
    MoreVertical,
} from 'lucide-react';
import messageService, { Conversation, Message } from '../../lib/messageService';
import socketService, { SocketMessage } from '../../lib/socketService';

interface ChatWindowProps {
    conversation: Conversation;
    currentUserId: string;
    onBack: () => void;
}

const timeFormat = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const dateLabel = (dateStr: string): string => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversation,
    currentUserId,
    onBack,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const displayName = conversation.type === 'direct'
        ? conversation.other_user?.full_name || 'Người dùng'
        : conversation.name || 'Nhóm chat';

    const avatarUrl = conversation.type === 'direct' ? conversation.other_user?.avatar_url : undefined;

    // ---- Load messages ----
    useEffect(() => {
        loadMessages();
        socketService.markRead(conversation.id);

        // Socket listeners
        const unsubMsg = socketService.onNewMessage((msg: SocketMessage) => {
            if (msg.conversation_id === conversation.id) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg as Message];
                });
                scrollToBottom();
                socketService.markRead(conversation.id);
            }
        });

        const unsubDel = socketService.onMessageDeleted((data) => {
            if (data.conversation_id === conversation.id) {
                setMessages((prev) => prev.filter(m => m.id !== data.message_id));
            }
        });

        const unsubTyping = socketService.onUserTyping((data) => {
            if (data.conversation_id === conversation.id && data.user_id !== currentUserId) {
                setTypingUser(data.full_name || 'Ai đó');
            }
        });

        const unsubStopTyping = socketService.onUserStopTyping((data) => {
            if (data.conversation_id === conversation.id && data.user_id !== currentUserId) {
                setTypingUser(null);
            }
        });

        return () => {
            unsubMsg();
            unsubDel();
            unsubTyping();
            unsubStopTyping();
        };
    }, [conversation.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const loadMessages = async (nextCursor?: string) => {
        if (!nextCursor) setLoading(true);
        try {
            const res = await messageService.getMessages(conversation.id, nextCursor || undefined, 30);
            if (res.success) {
                // Messages come newest first from API, reverse for display
                const newMsgs = [...res.data].reverse();
                setMessages((prev) => nextCursor ? [...newMsgs, ...prev] : newMsgs);
                setCursor(res.pagination?.next_cursor || null);
                setHasMore(res.pagination?.has_more || false);
            }
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        const text = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic local message
        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            conversation_id: conversation.id,
            sender_id: currentUserId,
            content: text,
            message_type: 'text',
            is_deleted: false,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            // Send via Socket first (real-time)
            socketService.sendMessage({
                conversation_id: conversation.id,
                content: text,
            });
        } catch {
            // Fallback to REST
            await messageService.sendMessage(conversation.id, text);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTyping = useCallback(() => {
        socketService.typing(conversation.id);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(conversation.id);
        }, 2000);
    }, [conversation.id]);

    const handleDeleteMessage = async (msgId: string) => {
        await messageService.deleteMessage(msgId);
        setMessages((prev) => prev.filter(m => m.id !== msgId));
    };

    // ---- Group messages by date ----
    const groupedMessages: { date: string; messages: Message[] }[] = [];
    let lastDate = '';
    messages.forEach((msg) => {
        const msgDate = dateLabel(msg.created_at);
        if (msgDate !== lastDate) {
            groupedMessages.push({ date: msgDate, messages: [msg] });
            lastDate = msgDate;
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <button
                    onClick={onBack}
                    className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm flex-shrink-0 ${conversation.type === 'group' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-violet-500 to-purple-600'
                    }`}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : conversation.type === 'group' ? (
                        <Users className="w-5 h-5" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                        {displayName}
                    </h3>
                    {typingUser && (
                        <p className="text-xs text-violet-500 animate-pulse">
                            {typingUser} đang nhập...
                        </p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-1 no-scrollbar"
            >
                {/* Load more */}
                {hasMore && (
                    <button
                        onClick={() => loadMessages(cursor || undefined)}
                        className="w-full text-center text-xs text-violet-500 hover:text-violet-700 font-medium py-2"
                    >
                        Tải tin nhắn cũ hơn
                    </button>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                            Hãy gửi tin nhắn đầu tiên! 👋
                        </p>
                    </div>
                ) : (
                    groupedMessages.map((group, gi) => (
                        <div key={gi}>
                            {/* Date separator */}
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                    {group.date}
                                </span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            </div>

                            {group.messages.map((msg, mi) => {
                                const isMine = msg.sender_id === currentUserId;
                                const showAvatar = !isMine && (
                                    mi === 0 ||
                                    group.messages[mi - 1].sender_id !== msg.sender_id
                                );

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-end gap-2 mb-1 group ${isMine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {/* Avatar (others) */}
                                        {!isMine && (
                                            <div className="w-7 flex-shrink-0">
                                                {showAvatar && (
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                                                        {msg.author?.avatar_url ? (
                                                            <img src={msg.author.avatar_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className={`max-w-[70%] ${isMine ? 'order-1' : ''}`}>
                                            {/* Sender name for group */}
                                            {showAvatar && conversation.type === 'group' && !isMine && (
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5 ml-1 font-medium">
                                                    {msg.author?.full_name || 'User'}
                                                </p>
                                            )}

                                            <div className={`relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isMine
                                                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-md shadow-sm'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md'
                                                }`}>
                                                {msg.content}

                                                {/* Time */}
                                                <span className={`block mt-0.5 text-[9px] ${isMine ? 'text-white/60 text-right' : 'text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                    {timeFormat(msg.created_at)}
                                                </span>

                                                {/* Delete (own messages) */}
                                                {isMine && !msg.id.startsWith('temp-') && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="p-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
