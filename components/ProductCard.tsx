import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoldButton } from './GoldButton';
import { Star, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorited, onToggleFavorite }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/piano/${product.id}`)}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-gray-50 dark:bg-gray-700/50 p-6 flex items-center justify-center">
        {product.badge && (
          <span className={`absolute top-4 left-4 ${product.badgeColor || 'bg-primary'} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm z-10`}>
            {product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal drop-shadow-md"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white text-lg truncate flex-1 pr-2" title={product.name}>
            {product.name}
          </h3>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none flex-shrink-0"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
            ))}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-5">
          <p className="text-primary font-bold text-xl">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </p>
          <span className="text-slate-500 text-sm">/ngày</span>
          {product.originalPrice && (
            <p className="text-slate-400 text-sm line-through decoration-1">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
            </p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <GoldButton className="py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md active:scale-95">
            Mua
          </GoldButton>
          <GoldButton className="py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-95">
            Mượn
          </GoldButton>
        </div>
      </div>
    </div>
  );
};
