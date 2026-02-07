import React, { useEffect, useState } from 'react';
import { Filter, ArrowRight, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../constants';
import pianoService from '../lib/pianoService';
import type { Piano } from '../types';

export const Marketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');
  const [pianos, setPianos] = useState<Piano[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPianos();
  }, [activeCategory]);

  const loadPianos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await pianoService.getAll({
        category: activeCategory !== 'Tất cả' ? activeCategory : undefined,
      });
      setPianos(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách piano');
      console.error('Error loading pianos:', err);
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
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {cat}
              </button>
            ))}
            <button className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              Bộ lọc <Filter className="w-4 h-4" />
            </button>
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
            <button
              onClick={loadPianos}
              className="mt-4 px-6 py-2 bg-primary hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Pianos Grid */}
        {!isLoading && !error && (
          <>
            {pianos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {pianos.map((piano) => (
                  <ProductCard key={piano.id} product={convertToProduct(piano)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Không tìm thấy piano nào trong danh mục này
                </p>
              </div>
            )}

            {pianos.length > 0 && (
              <div className="mt-16 text-center">
                <button className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-semibold transition-colors group">
                  Xem tất cả sản phẩm
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
