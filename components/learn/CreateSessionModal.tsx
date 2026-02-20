import React, { useState } from 'react';
import { X, Calendar, Clock, Users, FileText, Loader2 } from 'lucide-react';
import sessionService, { LiveSession } from '../../lib/sessionService';

interface CreateSessionModalProps {
    onClose: () => void;
    onCreated: (session: LiveSession) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ onClose, onCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [maxParticipants, setMaxParticipants] = useState(50);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
        if (!scheduledDate || !scheduledTime) { setError('Vui lòng chọn ngày và giờ'); return; }

        const scheduled_at = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

        setLoading(true);
        try {
            const res = await sessionService.createSession({
                title: title.trim(),
                description: description.trim() || undefined,
                scheduled_at,
                duration_minutes: durationMinutes,
                max_participants: maxParticipants,
            });

            if (res.success && res.data) {
                onCreated(res.data);
            } else {
                setError(res.message || 'Lỗi tạo buổi học');
            }
        } catch {
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    // Set default date/time to tomorrow at the next hour
    React.useEffect(() => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        now.setHours(now.getHours() + 1, 0, 0, 0);
        setScheduledDate(now.toISOString().split('T')[0]);
        setScheduledTime(now.toTimeString().substring(0, 5));
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Tạo buổi học mới</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Tiêu đề buổi học *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="VD: Học cơ bản phần 1 - Gam Do trưởng"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Mô tả
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Mô tả nội dung buổi học..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Ngày *
                            </label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={e => setScheduledDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Giờ *
                            </label>
                            <input
                                type="time"
                                value={scheduledTime}
                                onChange={e => setScheduledTime(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Duration & Max Participants */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Thời lượng (phút)
                            </label>
                            <select
                                value={durationMinutes}
                                onChange={e => setDurationMinutes(Number(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                            >
                                <option value={30}>30 phút</option>
                                <option value={45}>45 phút</option>
                                <option value={60}>60 phút</option>
                                <option value={90}>90 phút</option>
                                <option value={120}>120 phút</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                <Users className="w-4 h-4 inline mr-1" />
                                Số học sinh tối đa
                            </label>
                            <input
                                type="number"
                                value={maxParticipants}
                                onChange={e => setMaxParticipants(Math.max(1, Number(e.target.value)))}
                                min={1}
                                max={100}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {loading ? 'Đang tạo...' : 'Tạo buổi học'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
