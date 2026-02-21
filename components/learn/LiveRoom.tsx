import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ArrowLeft, Camera, CameraOff, Mic, MicOff, Monitor,
    PhoneOff, Users, MessageCircle, Settings, Loader2,
    Radio, Hand, Maximize2, Minimize2
} from 'lucide-react';
import sessionService, { LiveSession, LiveKitInfo, SessionParticipant } from '../../lib/sessionService';
import socketService from '../../lib/socketService';
import { SessionChat } from './SessionChat';
import { RoomConfigPanel } from './RoomConfigPanel';

interface LiveRoomProps {
    sessionId: string;
    currentUserId: string;
    userRole?: string;
    onLeave: () => void;
}

type SidePanel = 'none' | 'chat' | 'participants' | 'settings';

export const LiveRoom: React.FC<LiveRoomProps> = ({ sessionId, currentUserId, userRole, onLeave }) => {
    const [session, setSession] = useState<LiveSession | null>(null);
    const [livekitInfo, setLivekitInfo] = useState<LiveKitInfo | null>(null);
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidePanel, setSidePanel] = useState<SidePanel>('chat');
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [chatCount, setChatCount] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const isTeacher = userRole === 'teacher' || userRole === 'admin';

    // Join/Start session on mount
    useEffect(() => {
        joinOrStartSession();
        return () => {
            // Record analytics on leave
            sessionService.recordLeave(sessionId, { connection_quality: 'good' }).catch(() => { });
            sessionService.leaveSession(sessionId).catch(() => { });
        };
    }, [sessionId]);

    // Socket.io events
    useEffect(() => {
        const handleParticipantJoined = (data: { session_id: string; user: any }) => {
            if (data.session_id === sessionId) {
                setParticipants(prev => {
                    if (prev.some(p => p.user_id === data.user.id)) return prev;
                    return [...prev, { id: crypto.randomUUID(), session_id: sessionId, user_id: data.user.id, role: 'student', joined_at: new Date().toISOString(), user: data.user }];
                });
            }
        };

        const handleParticipantLeft = (data: { session_id: string; user_id: string }) => {
            if (data.session_id === sessionId) {
                setParticipants(prev => prev.filter(p => p.user_id !== data.user_id));
            }
        };

        const handleSessionEnded = (data: { session_id: string }) => {
            if (data.session_id === sessionId) {
                alert('Buổi học đã kết thúc!');
                onLeave();
            }
        };

        const handleChat = () => {
            if (sidePanel !== 'chat') {
                setChatCount(prev => prev + 1);
            }
        };

        socketService.on('participant_joined', handleParticipantJoined);
        socketService.on('participant_left', handleParticipantLeft);
        socketService.on('session_ended', handleSessionEnded);
        socketService.on('session_chat', handleChat);

        // Join socket room
        socketService.emit('join_session', { session_id: sessionId });

        return () => {
            socketService.off('participant_joined', handleParticipantJoined);
            socketService.off('participant_left', handleParticipantLeft);
            socketService.off('session_ended', handleSessionEnded);
            socketService.off('session_chat', handleChat);
            socketService.emit('leave_session', { session_id: sessionId });
        };
    }, [sessionId, sidePanel]);

    const joinOrStartSession = async () => {
        setLoading(true);
        setError('');
        try {
            // Get session details first
            const sessionRes = await sessionService.getSession(sessionId);
            if (!sessionRes.success) {
                setError('Không tìm thấy buổi học');
                return;
            }

            setSession(sessionRes.data);
            const s = sessionRes.data;
            const isOwner = s.teacher_id === currentUserId;

            let res;
            if (s.status === 'scheduled' && isOwner) {
                // Teacher starts the session
                res = await sessionService.startSession(sessionId);
            } else if (s.status === 'live') {
                // Join the live session
                res = await sessionService.joinSession(sessionId);
            } else {
                setError(`Buổi học đang ở trạng thái: ${s.status}`);
                return;
            }

            if (res.success && res.data) {
                setLivekitInfo(res.data.livekit);
                setSession(res.data.session);
            } else {
                setError(res.message || 'Không thể tham gia');
            }

            // Record analytics
            sessionService.recordJoin(sessionId, {
                browser: navigator.userAgent,
                platform: navigator.platform,
            }).catch(() => { });

            // Load participants
            const participantsRes = await sessionService.getParticipants(sessionId);
            if (participantsRes.success) {
                setParticipants(participantsRes.data || []);
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (!confirm('Bạn chắc chắn muốn kết thúc buổi học?')) return;
        const res = await sessionService.endSession(sessionId);
        if (res.success) {
            onLeave();
        }
    };

    const handleLeave = async () => {
        await sessionService.leaveSession(sessionId);
        onLeave();
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const toggleSidePanel = (panel: SidePanel) => {
        setSidePanel(prev => prev === panel ? 'none' : panel);
        if (panel === 'chat') setChatCount(0);
    };

    // Loading state
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                <p className="text-white text-lg font-semibold">Đang kết nối lớp học...</p>
                <p className="text-slate-400 text-sm mt-2">Vui lòng chờ</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center">
                <div className="bg-slate-800 rounded-2xl p-8 max-w-md text-center">
                    <p className="text-red-400 text-lg font-bold mb-2">Không thể tham gia</p>
                    <p className="text-slate-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={onLeave}
                        className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
            {/* Top Bar */}
            <div className="h-14 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onLeave}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-white flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            {session?.title || 'Lớp học'}
                        </h1>
                        <p className="text-xs text-slate-400">
                            {session?.teacher?.full_name} • {participants.length} người tham gia
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Video Area */}
                <div className="flex-1 p-4 flex flex-col min-w-0">
                    {/* Teacher Video (main) */}
                    <div className="flex-1 bg-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center mb-3">
                        {livekitInfo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                {/* LiveKit video placeholder — shows connection info */}
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                                        <Camera className="w-10 h-10 text-amber-400" />
                                    </div>
                                    <p className="text-white font-semibold text-lg mb-1">
                                        {isTeacher ? 'Camera giáo viên' : 'Đang xem stream giáo viên'}
                                    </p>
                                    <p className="text-slate-400 text-sm mb-4">
                                        LiveKit Room: {livekitInfo.room_id}
                                    </p>
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        {isTeacher && (
                                            <>
                                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">📸 Mặt</span>
                                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">🖐️ Tay</span>
                                                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">🎹 Piano</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-xs mt-4">
                                        Token đã sẵn sàng • Tích hợp @livekit/components-react để hiển thị video
                                    </p>
                                </div>

                                {/* Live badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    LIVE
                                </div>

                                {/* Participant count */}
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm text-white rounded-full text-xs">
                                    <Users className="w-3 h-3" />
                                    {participants.length}
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500">Đang chờ kết nối...</p>
                        )}
                    </div>

                    {/* Student thumbnails */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {participants.filter(p => p.role === 'student').slice(0, 6).map(p => (
                            <div key={p.user_id} className="w-24 h-16 bg-slate-800 rounded-xl shrink-0 flex items-center justify-center relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                    {p.user?.full_name?.[0] || '?'}
                                </div>
                                <span className="absolute bottom-1 left-1 right-1 text-[9px] text-slate-400 text-center truncate">
                                    {p.user?.full_name?.split(' ').pop()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Panel */}
                {sidePanel !== 'none' && (
                    <div className="w-80 border-l border-slate-700/50 flex flex-col shrink-0">
                        {sidePanel === 'chat' && (
                            <SessionChat sessionId={sessionId} currentUserId={currentUserId} />
                        )}
                        {sidePanel === 'participants' && (
                            <div className="flex flex-col h-full">
                                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-bold text-white">Người tham gia ({participants.length})</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {participants.map(p => (
                                        <div key={p.user_id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {p.user?.full_name?.[0] || '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-white truncate">{p.user?.full_name || 'Ẩn danh'}</p>
                                                <p className="text-[10px] text-slate-500">{p.role === 'teacher' ? '👨‍🏫 Giáo viên' : '👨‍🎓 Học sinh'}</p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {sidePanel === 'settings' && (
                            <div className="overflow-y-auto p-4">
                                <RoomConfigPanel sessionId={sessionId} isTeacher={isTeacher} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="h-16 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/50 flex items-center justify-center gap-3 px-4 shrink-0">
                {/* Camera toggle */}
                <button
                    onClick={() => setCameraOn(p => !p)}
                    className={`p-3 rounded-full transition-all ${cameraOn
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                >
                    {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </button>

                {/* Mic toggle */}
                <button
                    onClick={() => setMicOn(p => !p)}
                    className={`p-3 rounded-full transition-all ${micOn
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                >
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Screen share (teacher only) */}
                {isTeacher && (
                    <button className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all">
                        <Monitor className="w-5 h-5" />
                    </button>
                )}

                {/* Raise hand (student only) */}
                {!isTeacher && (
                    <button
                        onClick={() => setHandRaised(p => !p)}
                        className={`p-3 rounded-full transition-all ${handRaised
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                    >
                        <Hand className="w-5 h-5" />
                    </button>
                )}

                {/* Divider */}
                <div className="w-px h-8 bg-slate-700 mx-1" />

                {/* Chat toggle */}
                <button
                    onClick={() => toggleSidePanel('chat')}
                    className={`p-3 rounded-full transition-all relative ${sidePanel === 'chat'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                >
                    <MessageCircle className="w-5 h-5" />
                    {chatCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                            {chatCount > 9 ? '9+' : chatCount}
                        </span>
                    )}
                </button>

                {/* Participants toggle */}
                <button
                    onClick={() => toggleSidePanel('participants')}
                    className={`p-3 rounded-full transition-all ${sidePanel === 'participants'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                >
                    <Users className="w-5 h-5" />
                </button>

                {/* Settings toggle */}
                <button
                    onClick={() => toggleSidePanel('settings')}
                    className={`p-3 rounded-full transition-all ${sidePanel === 'settings'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                >
                    <Settings className="w-5 h-5" />
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-slate-700 mx-1" />

                {/* Leave / End */}
                <button
                    onClick={isTeacher ? handleEndSession : handleLeave}
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all hover:shadow-lg hover:shadow-red-500/25"
                >
                    <PhoneOff className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
