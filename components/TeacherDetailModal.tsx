import React, { useState } from 'react';
import { X, Check, XCircle, Award, Calendar, Mail, Phone, BookOpen } from 'lucide-react';

interface TeacherDetailModalProps {
    teacher: any;
    onClose: () => void;
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string, reason: string) => Promise<void>;
    loading?: boolean;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
    teacher,
    onClose,
    onApprove,
    onReject,
    loading = false
}) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const handleApprove = async () => {
        if (!confirm('Xác nhận phê duyệt hồ sơ giáo viên này?')) return;
        await onApprove(teacher.id);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        await onReject(teacher.id, rejectReason.trim());
        setShowRejectInput(false);
        setRejectReason('');
    };

    const statusColors = {
        pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    };

    const statusText = {
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Từ chối'
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Chi tiết hồ sơ giáo viên
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[teacher.verification_status as keyof typeof statusColors]}`}>
                            {statusText[teacher.verification_status as keyof typeof statusText]}
                        </span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Mail className="w-4 h-4" />
                                    Họ và tên
                                </label>
                                <p className="text-base text-slate-900 dark:text-white font-medium">
                                    {teacher.full_name || 'Chưa cập nhật'}
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </label>
                                <p className="text-base text-slate-900 dark:text-white">
                                    {teacher.email}
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Phone className="w-4 h-4" />
                                    Số điện thoại
                                </label>
                                <p className="text-base text-slate-900 dark:text-white">
                                    {teacher.phone || 'Chưa cập nhật'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <BookOpen className="w-4 h-4" />
                                    Chuyên môn
                                </label>
                                <p className="text-base text-slate-900 dark:text-white">
                                    {teacher.specializations || 'Chưa cập nhật'}
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Kinh nghiệm
                                </label>
                                <p className="text-base text-slate-900 dark:text-white">
                                    {teacher.years_experience || 0} năm
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Ngày đăng ký
                                </label>
                                <p className="text-base text-slate-900 dark:text-white">
                                    {new Date(teacher.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {teacher.bio && (
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                Giới thiệu
                            </label>
                            <p className="text-base text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg leading-relaxed">
                                {teacher.bio}
                            </p>
                        </div>
                    )}

                    {/* Certificates */}
                    {teacher.certificates && teacher.certificates.length > 0 && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                <Award className="w-4 h-4" />
                                Chứng chỉ ({teacher.certificates.length})
                            </label>
                            <div className="grid md:grid-cols-2 gap-3">
                                {teacher.certificates.map((cert: any, idx: number) => (
                                    <div 
                                        key={idx}
                                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                                    >
                                        <p className="font-semibold text-slate-900 dark:text-white mb-1">
                                            {cert.name}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {cert.issuer && `${cert.issuer} • `}{cert.year}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certificate Images - Placeholder for future */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                            Ảnh chứng chỉ
                        </label>
                        <div className="bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                            <p className="text-slate-500 dark:text-slate-400">
                                Tính năng đang phát triển - sẽ hiển thị ảnh chứng chỉ tại đây
                            </p>
                        </div>
                    </div>

                    {/* Demo Videos - Placeholder for future */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                            Video demo giảng dạy
                        </label>
                        <div className="bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                            <p className="text-slate-500 dark:text-slate-400">
                                Tính năng đang phát triển - sẽ hiển thị video demo tại đây
                            </p>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    {teacher.rejected_reason && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                                Lý do từ chối:
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {teacher.rejected_reason}
                            </p>
                        </div>
                    )}

                    {/* Approval Info */}
                    {teacher.approved_at && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                                Đã phê duyệt vào: {new Date(teacher.approved_at).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer - Action Buttons */}
                {teacher.verification_status === 'pending' && (
                    <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                        {!showRejectInput ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                    <Check className="w-5 h-5" />
                                    Phê duyệt hồ sơ
                                </button>
                                <button
                                    onClick={() => setShowRejectInput(true)}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Từ chối hồ sơ
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
                                >
                                    Đóng
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối hồ sơ..."
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleReject}
                                        disabled={loading || !rejectReason.trim()}
                                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                        Xác nhận từ chối
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRejectInput(false);
                                            setRejectReason('');
                                        }}
                                        className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {teacher.verification_status !== 'pending' && (
                    <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
                        >
                            Đóng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
