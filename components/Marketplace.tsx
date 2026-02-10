import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ArrowRight, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { GoldButton } from './GoldButton';
import { CATEGORIES } from '../constants';
import pianoService from '../lib/pianoService';
import favoriteService from '../lib/favoriteService';
import { useAuth } from '../contexts/AuthContext';
import type { Piano } from '../types';

export const Marketplace: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');
  const [pianos, setPianos] = useState<Piano[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      favoriteService.getMyFavorites()
        .then(favs => {
          setFavorites(new Set(favs.map(f => Number(f.piano_id))));
        })
        .catch(console.error);
    } else {
      setFavorites(new Set());
    }
  }, [isAuthenticated]);

  const handleToggleFavorite = async (id: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const isFav = favorites.has(id);
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      if (isFav) {
        await favoriteService.removeFavorite(id);
      } else {
        await favoriteService.addFavorite(id);
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFav) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPianos = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await pianoService.getAll({
          category: activeCategory !== 'Tất cả' ? activeCategory : undefined,
        });

        // Only update state if component is still mounted
        if (isMounted) {
          setPianos(data);
        }
      } catch (err: any) {
        if (isMounted) {
          // Don't show error for AbortError
          if (err.name !== 'AbortError') {
            setError(err.response?.data?.message || 'Không thể tải danh sách piano');
            console.error('Error loading pianos:', err);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPianos();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  const loadPianos = async () => {
    // This function is now defined inside useEffect
    // Keeping this stub for any manual refresh button
    setIsLoading(true);
    setError('');
    try {
      const data = await pianoService.getAll({
        category: activeCategory !== 'Tất cả' ? activeCategory : undefined,
      });
      setPianos(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || 'Không thể tải danh sách piano');
        console.error('Error loading pianos:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Convert Piano to Product format for ProductCard
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
  });

  return (
    <section className="py-16 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Piano Marketplace</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Tìm cây đàn phù hợp với nhu cầu của bạn {pianos.length > 0 && `(${pianos.length} sản phẩm)`}
            </p>
          </div>

          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 no-scrollbar mask-gradient-right">
            {CATEGORIES.map((cat) => (
              <GoldButton
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat
                  ? 'shadow-md'
                  : '!bg-slate-100 dark:!bg-slate-700/50 !bg-none text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {cat}
              </GoldButton>
            ))}
            <GoldButton className="!bg-slate-100 dark:!bg-slate-700/50 !bg-none text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              Bộ lọc <Filter className="w-4 h-4" />
            </GoldButton>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-slate-600 dark:text-slate-400">Đang tải piano...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <GoldButton
              onClick={loadPianos}
              className="mt-4 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Thử lại
            </GoldButton>
          </div>
        )}

        {/* Pianos Grid */}
        {!isLoading && !error && (
          <>
            {pianos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {pianos.map((piano) => (
                  <ProductCard
                    key={piano.id}
                    product={convertToProduct(piano)}
                    isFavorited={favorites.has(Number(piano.id))}
                    onToggleFavorite={() => handleToggleFavorite(Number(piano.id))}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Không tìm thấy piano nào trong danh mục này
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
