import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, Users, Plus, Edit2, Trash2,
    Check, X, Search, Filter, TrendingUp, GraduationCap, AlertCircle, CheckCircle, XCircle,
    ImageIcon, Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TeacherDetailModal } from '../components/TeacherDetailModal';
import pianoService, { Piano } from '../lib/pianoService';
import orderService, { OrderWithDetails } from '../lib/orderService';
import userService from '../lib/userService';
import uploadService from '../lib/uploadService';

export const AdminDashboard: React.FC = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'overview' | 'pianos' | 'orders' | 'users' | 'teachers'>('overview');

    // Data
    const [pianos, setPianos] = useState<Piano[]>([]);
    const [orders, setOrders] = useState<OrderWithDetails[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    // Piano CRUD
    const [showPianoModal, setShowPianoModal] = useState(false);
    const [editingPiano, setEditingPiano] = useState<Piano | null>(null);
    const [pianoForm, setPianoForm] = useState({
        name: '',
        image_url: '',
        category: 'Grand',
        price_per_hour: 0,
        rating: 5.0,
        reviews_count: 0,
        description: '',
        features: [] as string[],
    });
    const [featureInput, setFeatureInput] = useState('');

    // Order management
    const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
    const [orderNotes, setOrderNotes] = useState('');

    // Teacher management
    const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
    const [showTeacherModal, setShowTeacherModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Piano image upload
    const [pianoImageUploading, setPianoImageUploading] = useState(false);
    const [pianoImageProgress, setPianoImageProgress] = useState(0);

    useEffect(() => {
        // Wait for auth to finish loading before checking authentication
        if (authLoading) return;

        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/');
            return;
        }

        loadData();
    }, [authLoading, isAuthenticated, user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [pianosData, ordersData, usersData, teachersData, pianoStats, orderStats] = await Promise.all([
                pianoService.getAll(),
                orderService.getAllOrders(),
                userService.getAllUsers(),
                userService.getTeacherProfiles(),
                pianoService.getStats(),
                orderService.getOrderStats(),
            ]);

            setPianos(pianosData);
            setOrders(ordersData);
            setUsers(usersData);
            setTeachers(teachersData);
            setStats({ ...pianoStats, ...orderStats });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveTeacher = async (id: string) => {
        if (!confirm('Xác nhận phê duyệt hồ sơ giáo viên này?')) return;

        try {
            setLoading(true);
            await userService.approveTeacher(id);
            setSuccess('Đã phê duyệt hồ sơ giáo viên');
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectTeacher = async (id: string, reason: string) => {
        try {
            setLoading(true);
            await userService.rejectTeacher(id, reason);
            setSuccess('Đã từ chối hồ sơ giáo viên. Giáo viên có thể chỉnh sửa và nộp lại.');
            setShowTeacherModal(false);
            setSelectedTeacher(null);
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeTeacher = async (id: string) => {
        const reason = prompt('⚠️ HỦY HỢP ĐỒNG GIÁO VIÊN\n\nGiáo viên sẽ không thể mở lớp học cho đến khi nộp lại hồ sơ và được phê duyệt.\n\nNhập lý do hủy hợp đồng:');
        
        if (!reason || reason.trim() === '') {
            alert('Vui lòng nhập lý do hủy hợp đồng');
            return;
        }

        if (!confirm(`Xác nhận hủy hợp đồng?\n\nGiáo viên sẽ:\n- Không được mở lớp học mới\n- Phải nộp lại hồ sơ để được duyệt lại\n- GIỮ NGUYÊN tài khoản và role teacher`)) return;

        try {
            setLoading(true);
            await userService.revokeTeacher(id, reason.trim());
            setSuccess('Đã hủy hợp đồng. Giáo viên có thể nộp lại hồ sơ sau khi chỉnh sửa.');
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePianoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setError('');
            setPianoImageUploading(true);
            setPianoImageProgress(0);
            // Use editingPiano id or a temp id for new pianos
            const pianoId = editingPiano?.id?.toString() || 'new-' + Date.now();
            const publicUrl = await uploadService.uploadPianoImage(file, pianoId, (p) => {
                setPianoImageProgress(p);
            });
            setPianoForm(prev => ({ ...prev, image_url: publicUrl }));
            setSuccess('Upload ảnh piano thành công!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPianoImageUploading(false);
            setPianoImageProgress(0);
            e.target.value = '';
        }
    };

    // Piano CRUD handlers
    const handleOpenPianoModal = (piano?: Piano) => {
        if (piano) {
            setEditingPiano(piano);
            setPianoForm({
                name: piano.name,
                image_url: piano.image_url,
                category: piano.category,
                price_per_hour: piano.price_per_hour,
                rating: piano.rating,
                reviews_count: piano.reviews_count,
                description: piano.description,
                features: piano.features || [],
            });
        } else {
            setEditingPiano(null);
            setPianoForm({
                name: '',
                image_url: '',
                category: 'Grand',
                price_per_hour: 0,
                rating: 5.0,
                reviews_count: 0,
                description: '',
                features: [],
            });
        }
        setShowPianoModal(true);
    };

    const handleSavePiano = async () => {
        try {
            setLoading(true);
            setError('');

            if (editingPiano) {
                await pianoService.update(editingPiano.id, pianoForm);
                setSuccess('Cập nhật piano thành công!');
            } else {
                await pianoService.create(pianoForm);
                setSuccess('Tạo piano thành công!');
            }

            setShowPianoModal(false);
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePiano = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa piano này?')) return;

        try {
            setLoading(true);
            await pianoService.delete(id);
            setSuccess('Xóa piano thành công!');
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setPianoForm({
                ...pianoForm,
                features: [...pianoForm.features, featureInput.trim()],
            });
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setPianoForm({
            ...pianoForm,
            features: pianoForm.features.filter((_, i) => i !== index),
        });
    };

    // Order handlers
    const handleApproveOrder = async (orderId: number) => {
        try {
            setLoading(true);
            await orderService.approveOrder(orderId, orderNotes);
            setSuccess('Đã duyệt đơn hàng!');
            setSelectedOrder(null);
            setOrderNotes('');
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectOrder = async (orderId: number) => {
        if (!orderNotes.trim()) {
            setError('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setLoading(true);
            await orderService.rejectOrder(orderId, orderNotes);
            setSuccess('Đã từ chối đơn hàng!');
            setSelectedOrder(null);
            setOrderNotes('');
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // User handlers
    const handleUpdateUserRole = async (userId: string, role: 'user' | 'teacher' | 'admin') => {
        try {
            setLoading(true);
            await userService.updateUserRole(userId, role);
            setSuccess('Cập nhật role thành công!');
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">Đang tải...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-8">
                        🎛️ Admin Dashboard
                    </h1>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 rounded-lg flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')}><X className="w-5 h-5" /></button>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-lg flex justify-between items-center">
                            <span>{success}</span>
                            <button onClick={() => setSuccess('')}><X className="w-5 h-5" /></button>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
                            { id: 'pianos', label: 'Quản lý Pianos', icon: Package },
                            { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
                            { id: 'users', label: 'Người dùng', icon: Users },
                            { id: 'teachers', label: 'Giáo viên', icon: GraduationCap },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === id
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && stats && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Thống kê hệ thống</h2>

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Tổng Pianos', value: stats.total_pianos, icon: Package, color: 'blue' },
                                        { label: 'Đơn chờ duyệt', value: stats.pending, icon: ShoppingBag, color: 'yellow' },
                                        { label: 'Tổng doanh thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue), icon: TrendingUp, color: 'green' },
                                        { label: 'Người dùng', value: users.length, icon: Users, color: 'purple' },
                                    ].map((stat, i) => (
                                        <div key={i} className={`p-6 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 border border-${stat.color}-200 dark:border-${stat.color}-700`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mt-8">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Phân loại đơn hàng</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Đơn mua:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{stats.buyOrders}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Đơn mượn:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{stats.rentOrders}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Đã duyệt:</span>
                                                <span className="font-bold text-green-600">{stats.approved}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Bị từ chối:</span>
                                                <span className="font-bold text-red-600">{stats.rejected}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Thông tin Pianos</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Số categories:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{stats.total_categories}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Giá TB:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.avg_price)}/h
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Rating TB:</span>
                                                <span className="font-bold text-yellow-600">⭐ {stats.avg_rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pianos Tab */}
                        {activeTab === 'pianos' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Quản lý Pianos ({pianos.length})
                                    </h2>
                                    <button
                                        onClick={() => handleOpenPianoModal()}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Thêm Piano
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-100 dark:bg-slate-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Piano</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Giá/h</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Rating</th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {pianos.map((piano) => (
                                                    <tr key={piano.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <img src={piano.image_url} alt={piano.name} className="w-12 h-12 object-cover rounded" />
                                                                <span className="font-medium text-slate-900 dark:text-white">{piano.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{piano.category}</td>
                                                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                                                            {new Intl.NumberFormat('vi-VN').format(piano.price_per_hour)}đ
                                                        </td>
                                                        <td className="px-4 py-3 text-yellow-600">⭐ {piano.rating}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleOpenPianoModal(piano)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePiano(piano.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Quản lý đơn hàng ({orders.length})
                                </h2>

                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.filter(o => o.status === 'pending').length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-lg text-yellow-600 mb-3">🕐 Chờ duyệt</h3>
                                                {orders.filter(o => o.status === 'pending').map((order) => (
                                                    <OrderCard key={order.id} order={order} onApprove={handleApproveOrder} onReject={handleRejectOrder} />
                                                ))}
                                            </div>
                                        )}

                                        {orders.filter(o => o.status !== 'pending').length > 0 && (
                                            <div className="mt-8">
                                                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-3">Lịch sử</h3>
                                                {orders.filter(o => o.status !== 'pending').slice(0, 10).map((order) => (
                                                    <OrderCard key={order.id} order={order} isHistory />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Quản lý người dùng ({users.length})
                                </h2>

                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-100 dark:bg-slate-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Tên</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">SĐT</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slice-200 dark:divide-slate-700">
                                                {users.map((u) => (
                                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.full_name}</td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.phone || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={u.role}
                                                                onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                                                                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="teacher">Teacher</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 text-sm">
                                                            {new Date(u.created_at).toLocaleDateString('vi-VN')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Teachers Tab */}
                        {activeTab === 'teachers' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Quản lý Giáo viên ({teachers.length})
                                </h2>

                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : teachers.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        Không có hồ sơ giáo viên nào
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-100 dark:bg-slate-700">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Giáo viên</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Kinh nghiệm & Kỹ năng</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Trạng thái</th>
                                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {teachers.map((teacher: any) => {
                                                    const isApproved = teacher.verification_status === 'approved';
                                                    const isPending = teacher.verification_status === 'pending';
                                                    
                                                    return (
                                                        <tr 
                                                            key={teacher.id} 
                                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedTeacher(teacher);
                                                                setShowTeacherModal(true);
                                                            }}
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                                                        {teacher.avatar_url ? (
                                                                            <img 
                                                                                src={teacher.avatar_url} 
                                                                                alt={teacher.full_name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <span>{teacher.full_name?.charAt(0).toUpperCase() || 'G'}</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900 dark:text-white">
                                                                            {teacher.full_name || 'Chưa cập nhật'}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                            {teacher.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div>
                                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                                        {teacher.years_experience || 0} năm kinh nghiệm
                                                                    </p>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                                        {teacher.specializations || 'Chưa cập nhật'}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {isApproved ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                                                                        Đang hoạt động
                                                                    </span>
                                                                ) : isPending ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></span>
                                                                        Chờ duyệt
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5"></span>
                                                                        Từ chối
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRevokeTeacher(teacher.id);
                                                                    }}
                                                                    disabled={!isApproved}
                                                                    className={`text-sm font-medium px-3 py-1.5 rounded border transition-colors ${
                                                                        isApproved
                                                                            ? 'text-red-600 bg-red-50 border-red-100 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/50 dark:hover:bg-red-900/40'
                                                                            : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-60 dark:text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                                                                    }`}
                                                                >
                                                                    Hủy hợp đồng
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Piano Modal */}
                {showPianoModal && (
                    <PianoModal
                        piano={pianoForm}
                        isEdit={!!editingPiano}
                        onSave={handleSavePiano}
                        onClose={() => setShowPianoModal(false)}
                        onChange={setPianoForm}
                        featureInput={featureInput}
                        onFeatureInputChange={setFeatureInput}
                        onAddFeature={addFeature}
                        onRemoveFeature={removeFeature}
                        loading={loading}
                        onImageUpload={handlePianoImageUpload}
                        imageUploading={pianoImageUploading}
                        imageProgress={pianoImageProgress}
                    />
                )}

                {/* Teacher Detail Modal */}
                {showTeacherModal && selectedTeacher && (
                    <TeacherDetailModal
                        teacher={selectedTeacher}
                        onClose={() => {
                            setShowTeacherModal(false);
                            setSelectedTeacher(null);
                        }}
                        onApprove={async (id) => {
                            await handleApproveTeacher(id);
                            setShowTeacherModal(false);
                            setSelectedTeacher(null);
                        }}
                        onReject={handleRejectTeacher}
                        loading={loading}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
};

// Helper Components
const OrderCard: React.FC<{
    order: OrderWithDetails;
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
    isHistory?: boolean;
}> = ({ order, onApprove, onReject, isHistory }) => {
    const [notes, setNotes] = useState('');
    const [showActions, setShowActions] = useState(false);

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    };

    return (
        <div className={`p-4 border rounded-lg mb-3 ${order.status === 'pending' ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex items-start gap-4">
                {order.piano && (
                    <img src={order.piano.image_url} alt={order.piano.name} className="w-20 h-20 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{order.piano?.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[order.status]}`}>
                            {order.status}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                            {order.type === 'buy' ? 'Mua' : 'Mượn'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Khách hàng: {order.user?.full_name} ({order.user?.email})
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {order.type === 'rent' && order.rental_start_date && order.rental_end_date ? (
                            <span>{new Date(order.rental_start_date).toLocaleDateString('vi-VN')} - {new Date(order.rental_end_date).toLocaleDateString('vi-VN')} ({order.rental_days} ngày)</span>
                        ) : (
                            new Date(order.created_at).toLocaleDateString('vi-VN')
                        )}
                    </p>
                    <p className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
                    </p>
                </div>

                {!isHistory && order.status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-cyan-800"
                        >
                            Xử lý
                        </button>
                    </div>
                )}
            </div>

            {showActions && order.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ghi chú (tùy chọn cho duyệt, bắt buộc cho từ chối)"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-3"
                        rows={2}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                onApprove?.(order.id);
                                setNotes('');
                                setShowActions(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Check className="w-4 h-4" />
                            Duyệt
                        </button>
                        <button
                            onClick={() => {
                                if (notes.trim()) {
                                    onReject?.(order.id);
                                    setNotes('');
                                    setShowActions(false);
                                } else {
                                    alert('Vui lòng nhập lý do từ chối');
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            <X className="w-4 h-4" />
                            Từ chối
                        </button>
                        <button
                            onClick={() => setShowActions(false)}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {order.admin_notes && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded text-sm text-slate-600 dark:text-slate-400">
                    <strong>Ghi chú admin:</strong> {order.admin_notes}
                </div>
            )}
        </div>
    );
};

const PianoModal: React.FC<any> = ({
    piano, isEdit, onSave, onClose, onChange,
    featureInput, onFeatureInputChange, onAddFeature, onRemoveFeature, loading,
    onImageUpload, imageUploading, imageProgress
}) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isEdit ? 'Chỉnh sửa Piano' : 'Thêm Piano mới'}
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tên Piano</label>
                    <input
                        type="text"
                        value={piano.name}
                        onChange={(e) => onChange({ ...piano, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                        <select
                            value={piano.category}
                            onChange={(e) => onChange({ ...piano, category: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="Grand">Grand</option>
                            <option value="Upright">Upright</option>
                            <option value="Digital">Digital</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Giá/giờ (VND)</label>
                        <input
                            type="number"
                            value={piano.price_per_hour}
                            onChange={(e) => onChange({ ...piano, price_per_hour: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        Ảnh Piano
                    </label>
                    {piano.image_url ? (
                        <div className="space-y-2">
                            <img src={piano.image_url} alt="Piano" className="w-full h-40 object-cover rounded-lg" />
                            <div className="flex gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">
                                    <Upload className="w-4 h-4" />
                                    Đổi ảnh
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={onImageUpload}
                                        className="hidden"
                                        disabled={imageUploading}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...piano, image_url: '' })}
                                    className="px-4 py-2 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                            {imageUploading ? (
                                <div className="text-center">
                                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${imageProgress || 0}%` }} />
                                    </div>
                                    <span className="text-xs text-primary font-bold">{imageProgress || 0}%</span>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">Click để upload ảnh</span>
                                    <span className="text-xs text-slate-400">JPG, PNG, WEBP (tối đa 5MB)</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={onImageUpload}
                                className="hidden"
                                disabled={imageUploading}
                            />
                        </label>
                    )}
                    <input
                        type="text"
                        value={piano.image_url}
                        onChange={(e) => onChange({ ...piano, image_url: e.target.value })}
                        className="mt-2 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                        placeholder="Hoặc nhập URL trực tiếp..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
                    <textarea
                        value={piano.description}
                        onChange={(e) => onChange({ ...piano, description: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Features</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={featureInput}
                            onChange={(e) => onFeatureInputChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onAddFeature()}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="Nhập feature..."
                        />
                        <button
                            type="button"
                            onClick={onAddFeature}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-cyan-800"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {piano.features.map((feature: string, i: number) => (
                            <span
                                key={i}
                                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                                {feature}
                                <button
                                    type="button"
                                    onClick={() => onRemoveFeature(i)}
                                    className="hover:text-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={onSave}
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-cyan-800 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50"
                >
                    {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                    Hủy
                </button>
            </div>
        </div>
    </div>
);
