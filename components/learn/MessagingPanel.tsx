import React, { useState, useEffect } from 'react';
import { Lock, MessageCircle } from 'lucide-react';
import messageService, { Conversation } from '../../lib/messageService';
import socketService from '../../lib/socketService';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { NewConversationModal } from './NewConversationModal';

interface MessagingPanelProps {
    currentUserId?: string;
}

export const MessagingPanel: React.FC<MessagingPanelProps> = ({ currentUserId }) => {
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [socketReady, setSocketReady] = useState(false);

    // Connect socket on mount
    useEffect(() => {
        if (!currentUserId) return;

        const token = localStorage.getItem('token');
        if (token) {
            socketService.connect(token)
                .then(() => {
                    setSocketReady(true);
                    // Load and join conversations
                    messageService.getConversations().then(res => {
                        if (res.success && res.data.length > 0) {
                            const ids = res.data.map(c => c.id);
                            socketService.joinConversations(ids);
                        }
                    });
                })
                .catch(err => console.error('Socket connect failed:', err));
        }

        return () => {
            // Don't disconnect on unmount to keep notifications alive
        };
    }, [currentUserId]);

    // Check for pending conversation from global window
    useEffect(() => {
        if ((window as any).__pendingConversation) {
            const pending = (window as any).__pendingConversation;
            delete (window as any).__pendingConversation;
            setActiveConversation(pending);
        }
    }, [currentUserId]);

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversation(conv);
        socketService.joinConversations([conv.id]);
    };

    const handleConversationCreated = (conv: Conversation) => {
        setActiveConversation(conv);
        socketService.joinConversations([conv.id]);
    };

    if (!currentUserId) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">Cần đăng nhập</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">Vui lòng đăng nhập để xem tin nhắn</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
                <div className="flex h-full">
                    {/* Conversation List */}
                    <div className={`w-full lg:w-80 flex-shrink-0 ${activeConversation ? 'hidden lg:block' : 'block'}`}>
                        <ConversationList
                            activeConversationId={activeConversation?.id}
                            onSelectConversation={handleSelectConversation}
                            onNewConversation={() => setShowNewModal(true)}
                        />
                    </div>

                    {/* Chat Window or Empty State */}
                    <div className={`flex-1 ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}>
                        {activeConversation ? (
                            <div className="w-full">
                                <ChatWindow
                                    conversation={activeConversation}
                                    currentUserId={currentUserId}
                                    onBack={() => setActiveConversation(null)}
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                    <MessageCircle className="w-10 h-10 text-violet-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                                    Chọn một hội thoại
                                </h3>
                                <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                                    Chọn một cuộc hội thoại từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Conversation Modal */}
            <NewConversationModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onConversationCreated={handleConversationCreated}
                currentUserId={currentUserId}
            />
        </div>
    );
};
