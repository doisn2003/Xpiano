import React, { useState, useEffect } from 'react';
import { Settings, Camera, Mic, Monitor, Save, Loader2, Layers } from 'lucide-react';
import sessionService, { RoomConfig } from '../../lib/sessionService';
import socketService from '../../lib/socketService';

interface RoomConfigPanelProps {
    sessionId: string;
    isTeacher: boolean;
}

const LAYOUT_PRESETS = [
    { value: 'default', label: 'Mặc định', desc: 'Giáo viên lớn, học sinh nhỏ' },
    { value: 'grid', label: 'Lưới', desc: 'Tất cả bằng nhau' },
    { value: 'focus', label: 'Tập trung', desc: 'Chỉ giáo viên' },
    { value: 'piano', label: 'Piano', desc: 'Tay + mặt giáo viên' },
];

export const RoomConfigPanel: React.FC<RoomConfigPanelProps> = ({ sessionId, isTeacher }) => {
    const [config, setConfig] = useState<RoomConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studentPublish, setStudentPublish] = useState(false);
    const [studentScreenShare, setStudentScreenShare] = useState(false);
    const [layoutPreset, setLayoutPreset] = useState('default');

    useEffect(() => {
        loadConfig();
    }, [sessionId]);

    // Listen for real-time config updates
    useEffect(() => {
        const handleConfigUpdate = (newConfig: RoomConfig) => {
            setConfig(newConfig);
            if (newConfig.student_config) {
                setStudentPublish(newConfig.student_config.can_publish);
                setStudentScreenShare(newConfig.student_config.can_screen_share);
            }
            if (newConfig.layout_preset) {
                setLayoutPreset(newConfig.layout_preset);
            }
        };

        socketService.on('room_config_updated', handleConfigUpdate);
        return () => { socketService.off('room_config_updated', handleConfigUpdate); };
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const res = await sessionService.getRoomConfig(sessionId);
            if (res.success && res.data) {
                setConfig(res.data);
                setStudentPublish(res.data.student_config?.can_publish ?? false);
                setStudentScreenShare(res.data.student_config?.can_screen_share ?? false);
                setLayoutPreset(res.data.layout_preset || 'default');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!isTeacher) return;
        setSaving(true);
        try {
            await sessionService.configureRoom(sessionId, {
                student_config: {
                    ...config?.student_config,
                    can_publish: studentPublish,
                    can_screen_share: studentScreenShare,
                } as any,
                layout_preset: layoutPreset,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">Cài đặt phòng</span>
            </div>

            <div className="p-4 space-y-5">
                {/* Layout Preset */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        <Layers className="w-3 h-3 inline mr-1" />
                        Bố cục
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {LAYOUT_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => isTeacher && setLayoutPreset(preset.value)}
                                disabled={!isTeacher}
                                className={`p-3 rounded-xl border text-left transition-all text-xs ${layoutPreset === preset.value
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-amber-300'
                                    } ${!isTeacher ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <p className="font-semibold text-slate-700 dark:text-white">{preset.label}</p>
                                <p className="text-slate-400 mt-0.5">{preset.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Student Permissions */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Quyền học sinh
                    </label>
                    <div className="space-y-3">
                        <label className={`flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-600 ${!isTeacher ? 'opacity-60' : 'cursor-pointer'}`}>
                            <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-slate-700 dark:text-white">Camera & Mic</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={studentPublish}
                                onChange={e => isTeacher && setStudentPublish(e.target.checked)}
                                disabled={!isTeacher}
                                className="w-4 h-4 accent-amber-500"
                            />
                        </label>

                        <label className={`flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-600 ${!isTeacher ? 'opacity-60' : 'cursor-pointer'}`}>
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-violet-500" />
                                <span className="text-sm text-slate-700 dark:text-white">Chia sẻ màn hình</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={studentScreenShare}
                                onChange={e => isTeacher && setStudentScreenShare(e.target.checked)}
                                disabled={!isTeacher}
                                className="w-4 h-4 accent-amber-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Teacher Camera Info */}
                {config?.teacher_config && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Camera giáo viên
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {config.teacher_config.allowed_sources?.map(src => (
                                <span key={src} className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                    {src === 'camera_face' && '📸 Mặt'}
                                    {src === 'camera_hands' && '🖐️ Tay'}
                                    {src === 'screen_piano' && '🎹 Piano'}
                                    {src === 'audio' && '🎤 Micro'}
                                    {!['camera_face', 'camera_hands', 'screen_piano', 'audio'].includes(src) && src}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Button (teacher only) */}
                {isTeacher && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </button>
                )}
            </div>
        </div>
    );
};
