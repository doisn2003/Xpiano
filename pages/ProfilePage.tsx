import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, ShoppingBag, Calendar, Edit2, Lock, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import favoriteService, { FavoriteWithPiano } from '../lib/favoriteService';
import orderService, { OrderWithDetails } from '../lib/orderService';
import userService from '../lib/userService';

export const ProfilePage: React.FC = () => {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'info' | 'favorites' | 'orders' | 'rentals'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Data
    const [favorites, setFavorites] = useState<FavoriteWithPiano[]>([]);
    const [orders, setOrders] = useState<OrderWithDetails[]>([]);
    const [rentals, setRentals] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user) {
            setEditedName(user.full_name);
            setEditedPhone(user.phone || '');
        }

        loadData();
    }, [isAuthenticated, user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [favs, ords, rents] = await Promise.all([
                favoriteService.getMyFavorites(),
                orderService.getMyOrders(),
                orderService.getMyActiveRentals(),
            ]);

            setFavorites(favs);
            setOrders(ords);
            setRentals(rents);
        } catch (err: any) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setError('');
            setSuccess('');
            setLoading(true);

            await userService.updateProfile({
                full_name: editedName,
                phone: editedPhone,
            });

            await refreshUser();
            setSuccess('Cập nhật thông tin thành công!');
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            setError('');
            setSuccess('');

            if (newPassword.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }

            if (newPassword !== confirmPassword) {
                setError('Mật khẩu xác nhận không khớp');
                return;
            }

            setLoading(true);
            await userService.changePassword(newPassword);

            setSuccess('Đổi mật khẩu thành công!');
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (pianoId: number) => {
        try {
            await favoriteService.removeFavorite(pianoId);
            setFavorites(favorites.filter(f => f.piano_id !== pianoId));
            setSuccess('Đã xóa khỏi danh sách yêu thích');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

        try {
            await orderService.cancelOrder(orderId);
            loadData();
            setSuccess('Đã hủy đơn hàng');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Chờ duyệt' },
            approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Đã duyệt' },
            rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Bị từ chối' },
            cancelled: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Đã hủy' },
            completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Hoàn thành' },
        };

        const badge = badges[status] || badges.pending;
        return (
            <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                {badge.label}
            </span>
        );
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-8">
                        Tài khoản của tôi
                    </h1>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        {[
                            { id: 'info', label: 'Thông tin', icon: User },
                            { id: 'favorites', label: 'Yêu thích', icon: Heart },
                            { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
                            { id: 'rentals', label: 'Đang mượn', icon: Calendar },
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
                                {id === 'favorites' && favorites.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>
                                )}
                                {id === 'rentals' && rentals.length > 0 && (
                                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{rentals.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                        {/* Info Tab */}
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thông tin cá nhân</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-cyan-800"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Họ và tên
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-slate-900 dark:text-white font-medium">{user.full_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Email
                                        </label>
                                        <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
                                        <p className="text-xs text-slate-500 mt-1">Email không thể thay đổi</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Số điện thoại
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editedPhone}
                                                onChange={(e) => setEditedPhone(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                placeholder="09xxxxxxxx"
                                            />
                                        ) : (
                                            <p className="text-slate-900 dark:text-white font-medium">{user.phone || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Vai trò
                                        </label>
                                        <p className="text-slate-900 dark:text-white font-medium capitalize">
                                            {user.role === 'admin' ? 'Quản trị viên' : user.role === 'teacher' ? 'Giáo viên' : 'Người dùng'}
                                        </p>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            Lưu thay đổi
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditedName(user.full_name);
                                                setEditedPhone(user.phone || '');
                                            }}
                                            className="flex items-center gap-2 px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                            Hủy
                                        </button>
                                    </div>
                                )}

                                <hr className="border-slate-200 dark:border-slate-700" />

                                <div>
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Favorites Tab */}
                        {activeTab === 'favorites' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Đàn piano yêu thích ({favorites.length})
                                </h2>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : favorites.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-600 dark:text-slate-400">Chưa có đàn piano yêu thích</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {favorites.map((fav) => (
                                            <div
                                                key={fav.id}
                                                className="flex gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => navigate(`/piano/${fav.piano_id}`)}
                                            >
                                                <img
                                                    src={fav.piano.image_url}
                                                    alt={fav.piano.name}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                        {fav.piano.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                        {fav.piano.category}
                                                    </p>
                                                    <p className="text-primary font-bold">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fav.piano.price_per_hour)}/h
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFavorite(fav.piano_id);
                                                    }}
                                                    className="p-2 h-fit hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <X className="w-5 h-5 text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Lịch sử đơn hàng ({orders.length})
                                </h2>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-600 dark:text-slate-400">Chưa có đơn hàng nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                                            >
                                                {order.piano && (
                                                    <img
                                                        src={order.piano.image_url}
                                                        alt={order.piano.name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                                            {order.piano?.name || 'Piano'}
                                                        </h3>
                                                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                                                            {order.type === 'buy' ? 'Mua' : 'Mượn'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                        {order.type === 'rent' && order.rental_start_date && order.rental_end_date ? (
                                                            <span>
                                                                {new Date(order.rental_start_date).toLocaleDateString('vi-VN')} - {new Date(order.rental_end_date).toLocaleDateString('vi-VN')} ({order.rental_days} ngày)
                                                            </span>
                                                        ) : (
                                                            new Date(order.created_at).toLocaleDateString('vi-VN')
                                                        )}
                                                    </p>
                                                    <p className="text-primary font-bold">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(order.status)}
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                                                        >
                                                            Hủy đơn
                                                        </button>
                                                    )}
                                                    {order.status === 'rejected' && order.admin_notes && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                                            Lý do: {order.admin_notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rentals Tab */}
                        {activeTab === 'rentals' && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Đàn đang mượn ({rentals.length})
                                </h2>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : rentals.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-600 dark:text-slate-400">Không có đàn đang mượn</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {rentals.map((rental) => (
                                            <div
                                                key={rental.id}
                                                className="flex items-center gap-4 p-4 border-2 border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/10"
                                            >
                                                {rental.piano && (
                                                    <img
                                                        src={rental.piano.image_url}
                                                        alt={rental.piano.name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                        {rental.piano?.name || 'Piano'}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                        {new Date(rental.start_date).toLocaleDateString('vi-VN')} - {new Date(rental.end_date).toLocaleDateString('vi-VN')}
                                                    </p>
                                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                        Còn {Math.max(0, Math.ceil((new Date(rental.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} ngày
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đổi mật khẩu</h2>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Ít nhất 6 ký tự"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Xác nhận mật khẩu
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-cyan-800 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50"
                                >
                                    {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};
