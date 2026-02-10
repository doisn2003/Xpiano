import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Filter } from '../components/Filter';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../constants';
import pianoService, { Piano } from '../lib/pianoService';
import favoriteService from '../lib/favoriteService';
import orderService from '../lib/orderService';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [allPianos, setAllPianos] = useState<Piano[]>([]);
    const [filteredPianos, setFilteredPianos] = useState<Piano[]>([]);
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    // Initial Load
    useEffect(() => {
        Promise.all([
            pianoService.getAll(),
            isAuthenticated ? favoriteService.getMyFavorites() : Promise.resolve([])
        ]).then(([pianos, favs]) => {
            setAllPianos(pianos);
            setFilteredPianos(pianos);
            if (Array.isArray(favs)) {
                setFavorites(new Set(favs.map(f => Number(f.piano_id))));
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [isAuthenticated]);

    // Search Handler (received from Filter component, already debounced)
    const handleSearch = (filters: {
        query: string;
        category: string;
        minPrice: number;
        maxPrice: number;
        minRating: number;
        features: string[];
    }) => {
        setIsSearching(true);

        // Simulate real-time search processing if needed, but it's client side so it's fast.
        // The debounce is in the Filter component.

        const results = allPianos.filter(piano => {
            // 1. Text Search (Name & Description)
            const searchText = (piano.name + ' ' + piano.description).toLowerCase();
            if (filters.query && !searchText.includes(filters.query.toLowerCase())) {
                return false;
            }

            // 2. Category
            if (filters.category !== 'Tất cả' && piano.category !== filters.category) {
                return false;
            }

            // 3. Price Range (Using Buy Price for 0-100M range)
            // If we used rent price, 100M would be irrelevant.
            const buyPrice = orderService.calculateBuyPrice(piano.price_per_hour);
            if (buyPrice < filters.minPrice || buyPrice > filters.maxPrice) {
                return false;
            }

            // 4. Rating
            if (piano.rating < filters.minRating) {
                return false;
            }

            // 5. Features (Must have AT LEAST ONE of the selected features - OR Logic)
            if (filters.features.length > 0) {
                const pianoFeatures = piano.features || [];
                const hasAnyFeature = filters.features.some(f =>
                    pianoFeatures.some(pf => pf.toLowerCase().includes(f.toLowerCase()))
                );
                if (!hasAnyFeature) return false;
            }

            return true;
        });

        setFilteredPianos(results);
        setIsSearching(false);
    };

    const handleToggleFavorite = async (id: number) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const numericId = Number(id);
        const isFav = favorites.has(numericId);

        // Optimistic Update
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) next.delete(numericId);
            else next.add(numericId);
            return next;
        });

        try {
            if (isFav) {
                await favoriteService.removeFavorite(numericId);
            } else {
                await favoriteService.addFavorite(numericId);
            }
        } catch (error) {
            // Revert
            setFavorites(prev => {
                const next = new Set(prev);
                if (isFav) next.add(numericId);
                else next.delete(numericId);
                return next;
            });
            console.error(error);
        }
    };

    // Helper to convert to ProductCard format
    const convertToProduct = (piano: Piano) => ({
        id: piano.id,
        name: piano.name,
        rating: piano.rating,
        reviews: piano.reviews_count,
        price: piano.price_per_hour,
        image: piano.image_url,
        category: piano.category,
        description: piano.description,
        features: piano.features,
        // Add buy price for display if needed? 
        // The ProductCard expects 'price' which usually is rent price in this app context.
    });

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
            <Header />

            {/* Advertising Div */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-3 text-center text-sm font-medium shadow-md relative z-10 w-full">
                🎉 Khuyến mãi mùa hè: Giảm giá 20% cho tất cả đơn thuê trên 1 tháng! Nhập mã: SUMMER2026
            </div>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar Filter */}
                    <aside className="w-full lg:w-80 flex-shrink-0 z-20">
                        <Filter
                            onSearch={handleSearch}
                            categories={CATEGORIES}
                            isLoading={isSearching}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        <div className="mb-6 flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                                Kết quả tìm kiếm
                            </h1>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Hiển thị {filteredPianos.length} cây đàn
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            </div>
                        ) : filteredPianos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredPianos.map(piano => (
                                    <ProductCard
                                        key={piano.id}
                                        product={convertToProduct(piano)}
                                        isFavorited={favorites.has(Number(piano.id))}
                                        onToggleFavorite={() => handleToggleFavorite(Number(piano.id))}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400 text-lg">
                                    Không tìm thấy cây đàn nào phù hợp.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 text-primary hover:underline"
                                >
                                    Xóa bộ lọc và thử lại
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
