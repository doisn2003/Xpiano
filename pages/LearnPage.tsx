import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { LearnSidebar, LearnTab } from '../components/learn/LearnSidebar';
import { SocialFeed } from '../components/learn/SocialFeed';
import { MessagingPanel } from '../components/learn/MessagingPanel';
import { ClassroomHub } from '../components/learn/ClassroomHub';
import { MyStats } from '../components/learn/MyStats';
import { NotificationBell } from '../components/learn/NotificationBell';
import socketService from '../lib/socketService';

export const LearnPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<LearnTab>('feed');
    const navigate = useNavigate();

    // Connect socket once when user is authenticated
    useEffect(() => {
        if (user?.id) {
            const token = localStorage.getItem('token');
            if (token) {
                socketService.connect(token).catch(err => {
                    console.warn('Socket connect failed (server may be offline):', err.message);
                });
            }
        }

        return () => {
            // Disconnect when leaving the page
            socketService.disconnect();
        };
    }, [user?.id]);

    const renderContent = () => {
        switch (activeTab) {
            case 'feed':
                return (
                    <SocialFeed
                        currentUserId={user?.id}
                        userName={user?.full_name}
                        userAvatar={user?.avatar_url}
                    />
                );
            case 'messages':
                return <MessagingPanel currentUserId={user?.id} />;
            case 'classrooms':
                return <ClassroomHub currentUserId={user?.id} />;
            case 'stats':
                return <MyStats currentUserId={user?.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <Header />

            {/* Notification Bell (floating top-right for logged-in users) */}
            {user?.id && (
                <div className="fixed top-3 right-28 z-40">
                    <NotificationBell currentUserId={user.id} />
                </div>
            )}

            <div className="flex">
                {/* Sidebar */}
                <LearnSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    userName={user?.full_name}
                    userAvatar={user?.avatar_url}
                    userRole={user?.role}
                />

                {/* Main Content */}
                <main className="flex-1 min-h-[calc(100vh-64px)] p-4 lg:p-6 xl:p-8 pb-24 lg:pb-8 overflow-x-hidden">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
