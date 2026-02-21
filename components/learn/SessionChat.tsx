import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import sessionService, { SessionChatMessage } from '../../lib/sessionService';
import socketService from '../../lib/socketService';

interface SessionChatProps {
    sessionId: string;
    currentUserId: string;
}

export const SessionChat: React.FC<SessionChatProps> = ({ sessionId, currentUserId }) => {
    const [messages, setMessages] = useState<SessionChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Load chat history
    useEffect(() => {
        loadHistory();
    }, [sessionId]);

    // Listen for real-time chat messages
    useEffect(() => {
        const handleChat = (msg: SessionChatMessage) => {
            if (msg.session_id === sessionId) {
                setMessages(prev => {
                    // Deduplicate
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            }
        };

        socketService.on('session_chat', handleChat);
        return () => { socketService.off('session_chat', handleChat); };
    }, [sessionId]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await sessionService.getChatHistory(sessionId, { limit: 50 });
            if (res.success) {
                setMessages(res.data || []);
                setTimeout(scrollToBottom, 100);
            }
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;

        setInput('');
        setSending(true);
        try {
            const res = await sessionService.sendChatMessage(sessionId, text);
            if (res.success && res.data) {
                // Message will also arrive via Socket.io, but add immediately for responsiveness
                setMessages(prev => {
                    if (prev.some(m => m.id === res.data.id)) return prev;
                    return [...prev, res.data];
                });
                scrollToBottom();
            }
        } finally {
            setSending(false);
        }
    };

    const groupByTime = useCallback((msgs: SessionChatMessage[]) => {
        const groups: { date: string; messages: SessionChatMessage[] }[] = [];
        let currentDate = '';

        msgs.forEach(msg => {
            const d = new Date(msg.created_at).toLocaleDateString('vi-VN');
            if (d !== currentDate) {
                currentDate = d;
                groups.push({ date: d, messages: [] });
            }
            groups[groups.length - 1].messages.push(msg);
        });

        return groups;
    }, []);

    const groups = groupByTime(messages);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">Chat lớp học</span>
                <span className="text-xs text-slate-400">({messages.length})</span>
            </div>

            {/* Messages */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 text-sm text-slate-400">
                        Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện! 💬
                    </div>
                ) : (
                    groups.map(group => (
                        <div key={group.date}>
                            <div className="text-center mb-2">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                                    {group.date}
                                </span>
                            </div>
                            {group.messages.map(msg => {
                                const isMe = msg.user_id === currentUserId;
                                return (
                                    <div key={msg.id} className={`flex gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        {!isMe && (
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                                {msg.author?.full_name?.[0] || '?'}
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && (
                                                <p className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.author?.full_name}</p>
                                            )}
                                            <div className={`px-3 py-2 rounded-2xl text-sm break-words ${isMe
                                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-sm'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-tl-sm'
                                                }`}>
                                                {msg.message}
                                            </div>
                                            <p className={`text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 px-1 ${isMe ? 'text-right' : ''}`}>
                                                {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-40 hover:shadow-md transition-all"
                >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </form>
        </div>
    );
};
