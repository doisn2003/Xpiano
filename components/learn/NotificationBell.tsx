import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    Check,
    CheckCheck,
    X,
    MessageCircle,
    Heart,
    UserPlus,
    Flag,
    Loader2,
} from 'lucide-react';
import messageService, { Notification } from '../../lib/messageService';
import socketService from '../../lib/socketService';

interface NotificationBellProps {
    currentUserId?: string;
}

const iconMap: Record<string, React.ReactNode> = {
    message: <MessageCircle className="w-4 h-4 text-violet-500" />,
    like: <Heart className="w-4 h-4 text-red-500" />,
    follow: <UserPlus className="w-4 h-4 text-cyan-500" />,
    comment: <MessageCircle className="w-4 h-4 text-blue-500" />,
    report: <Flag className="w-4 h-4 text-amber-500" />,
};

const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins}p`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
};

export const NotificationBell: React.FC<NotificationBellProps> = ({ currentUserId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentUserId) return;

        // Load unread count
        loadUnreadCount();

        // Socket listeners
        const unsubNotif = socketService.onNewNotification((notif) => {
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        const unsubCount = socketService.onUnreadCount((data) => {
            setUnreadCount(data.count);
        });

        return () => {
            unsubNotif();
            unsubCount();
        };
    }, [currentUserId]);

    // Click outside to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadUnreadCount = async () => {
        const res = await messageService.getUnreadCount();
        if (res.success && res.data) {
            setUnreadCount(res.data.unread_count);
        }
    };

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await messageService.getNotifications(undefined, 20);
            if (res.success) {
                setNotifications(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (!isOpen && notifications.length === 0) {
            loadNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAllRead = async () => {
        await messageService.markAllNotificationsRead();
        setNotifications((prev) => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleMarkRead = async (notifId: string) => {
        await messageService.markNotificationRead(notifId);
        setNotifications((prev) => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    if (!currentUserId) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[500px] no-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-10">
                                <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có thông báo</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${notif.is_read
                                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            : 'bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {iconMap[notif.type] || <Bell className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-relaxed ${notif.is_read
                                                ? 'text-slate-500 dark:text-slate-400'
                                                : 'text-slate-700 dark:text-slate-200 font-medium'
                                            }`}>
                                            <span className="font-semibold">{notif.title}</span>
                                            {notif.body && (
                                                <span className="block mt-0.5 text-slate-400 dark:text-slate-500 truncate">{notif.body}</span>
                                            )}
                                        </p>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                            {timeAgo(notif.created_at)}
                                        </span>
                                    </div>
                                    {!notif.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
