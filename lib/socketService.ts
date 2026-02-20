import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ---- Types ----
export interface SocketMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    message_type: 'text' | 'image' | 'audio' | 'system';
    media_url?: string;
    reply_to_id?: string;
    created_at: string;
    author?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        role?: string;
    };
}

export interface TypingEvent {
    conversation_id: string;
    user_id: string;
    full_name?: string;
}

type EventHandler = (...args: any[]) => void;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<EventHandler>> = new Map();
    private connectionPromise: Promise<void> | null = null;

    /**
     * Connect to the Socket.io server with the user's token.
     */
    connect(token: string): Promise<void> {
        if (this.socket?.connected) return Promise.resolve();

        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = new Promise((resolve, reject) => {
            this.socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionAttempts: 10,
            });

            this.socket.on('connect', () => {
                console.log('🔌 Socket connected');
                this.connectionPromise = null;
                resolve();
            });

            this.socket.on('connect_error', (err) => {
                console.error('🔌 Socket connection error:', err.message);
                this.connectionPromise = null;
                reject(err);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('🔌 Socket disconnected:', reason);
            });

            // Re-emit all registered listeners
            this.listeners.forEach((handlers, event) => {
                handlers.forEach((handler) => {
                    this.socket?.on(event, handler);
                });
            });
        });

        return this.connectionPromise;
    }

    /**
     * Disconnect from the server.
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connectionPromise = null;
    }

    /**
     * Check if connected.
     */
    get isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // ---- Emit events ----

    joinConversations(conversationIds: string[]): void {
        this.socket?.emit('join_conversations', conversationIds);
    }

    sendMessage(data: {
        conversation_id: string;
        content: string;
        message_type?: string;
        media_url?: string;
        reply_to_id?: string;
    }): void {
        this.socket?.emit('send_message', data);
    }

    typing(conversationId: string): void {
        this.socket?.emit('typing', { conversation_id: conversationId });
    }

    stopTyping(conversationId: string): void {
        this.socket?.emit('stop_typing', { conversation_id: conversationId });
    }

    markRead(conversationId: string): void {
        this.socket?.emit('mark_read', { conversation_id: conversationId });
    }

    // ---- Listen to events ----

    on(event: string, handler: EventHandler): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler);
        this.socket?.on(event, handler);
    }

    off(event: string, handler: EventHandler): void {
        this.listeners.get(event)?.delete(handler);
        this.socket?.off(event, handler);
    }

    // ---- Convenience event listeners ----

    onNewMessage(handler: (msg: SocketMessage) => void): () => void {
        this.on('new_message', handler);
        return () => this.off('new_message', handler);
    }

    onMessageDeleted(handler: (data: { message_id: string; conversation_id: string }) => void): () => void {
        this.on('message_deleted', handler);
        return () => this.off('message_deleted', handler);
    }

    onUserTyping(handler: (data: TypingEvent) => void): () => void {
        this.on('user_typing', handler);
        return () => this.off('user_typing', handler);
    }

    onUserStopTyping(handler: (data: TypingEvent) => void): () => void {
        this.on('user_stop_typing', handler);
        return () => this.off('user_stop_typing', handler);
    }

    onNewNotification(handler: (notification: any) => void): () => void {
        this.on('new_notification', handler);
        return () => this.off('new_notification', handler);
    }

    onUnreadCount(handler: (data: { count: number }) => void): () => void {
        this.on('unread_count', handler);
        return () => this.off('unread_count', handler);
    }
}

export default new SocketService();
