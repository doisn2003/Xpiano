import api from './api';

// ---- Types ----
export interface Conversation {
    id: string;
    type: 'direct' | 'group';
    name?: string;
    created_by: string;
    last_message_at: string;
    last_message_preview?: string;
    created_at: string;
    other_user?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        role?: string;
    };
    has_unread: boolean;
    is_muted: boolean;
    last_read_at?: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    message_type: 'text' | 'image' | 'audio' | 'system';
    media_url?: string;
    reply_to_id?: string;
    is_deleted: boolean;
    created_at: string;
    author?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        role?: string;
    };
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body?: string;
    data?: any;
    is_read: boolean;
    created_at: string;
}

interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        has_more: boolean;
        next_cursor: string | null;
        count: number;
    };
    message?: string;
}

class MessageService {
    // ========================
    // CONVERSATIONS
    // ========================

    async getConversations(cursor?: string, limit = 20): Promise<PaginatedResponse<Conversation>> {
        try {
            const params: any = { limit };
            if (cursor) params.cursor = cursor;
            const res = await api.get('/messages/conversations', { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải hội thoại' };
        }
    }

    async createConversation(userId: string): Promise<{ success: boolean; data?: Conversation; message?: string }> {
        try {
            const res = await api.post('/messages/conversations', { user_id: userId });
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi tạo hội thoại' };
        }
    }

    // ========================
    // MESSAGES
    // ========================

    async getMessages(conversationId: string, cursor?: string, limit = 30): Promise<PaginatedResponse<Message>> {
        try {
            const params: any = { limit };
            if (cursor) params.cursor = cursor;
            const res = await api.get(`/messages/conversations/${conversationId}/messages`, { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải tin nhắn' };
        }
    }

    async sendMessage(conversationId: string, content: string, messageType = 'text', mediaUrl?: string): Promise<{ success: boolean; data?: Message; message?: string }> {
        try {
            const res = await api.post(`/messages/conversations/${conversationId}/messages`, {
                content,
                message_type: messageType,
                media_url: mediaUrl,
            });
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi gửi tin nhắn' };
        }
    }

    async deleteMessage(messageId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const res = await api.delete(`/messages/${messageId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Lỗi xóa tin nhắn' };
        }
    }

    // ========================
    // NOTIFICATIONS
    // ========================

    async getNotifications(cursor?: string, limit = 20, unreadOnly = false): Promise<PaginatedResponse<Notification>> {
        try {
            const params: any = { limit };
            if (cursor) params.cursor = cursor;
            if (unreadOnly) params.unread_only = 'true';
            const res = await api.get('/notifications', { params });
            return res.data;
        } catch (error: any) {
            return { success: false, data: [], message: error.response?.data?.message || 'Lỗi tải thông báo' };
        }
    }

    async getUnreadCount(): Promise<{ success: boolean; data?: { unread_count: number } }> {
        try {
            const res = await api.get('/notifications/unread-count');
            return res.data;
        } catch (error: any) {
            return { success: false };
        }
    }

    async markNotificationRead(notifId: string): Promise<{ success: boolean }> {
        try {
            const res = await api.put(`/notifications/${notifId}/read`);
            return res.data;
        } catch (error: any) {
            return { success: false };
        }
    }

    async markAllNotificationsRead(): Promise<{ success: boolean }> {
        try {
            const res = await api.put('/notifications/read-all');
            return res.data;
        } catch (error: any) {
            return { success: false };
        }
    }

    async deleteNotification(notifId: string): Promise<{ success: boolean }> {
        try {
            const res = await api.delete(`/notifications/${notifId}`);
            return res.data;
        } catch (error: any) {
            return { success: false };
        }
    }
}

export default new MessageService();
