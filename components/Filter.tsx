import React, { useState, useEffect } from 'react';
import { DualRangeSlider } from './DualRangeSlider';
import { Search, Filter as FilterIcon, X } from 'lucide-react';
import { GoldButton } from './GoldButton';

interface FilterProps {
    onSearch: (filters: {
        query: string;
        category: string;
        minPrice: number;
        maxPrice: number;
        minRating: number;
        features: string[];
    }) => void;
    categories: string[];
    isLoading?: boolean;
}

const FEATURE_OPTIONS = [
    'Silent System',
    'Soft Fall',
    'Sostenuto Pedal',
    'Humidity Control',
    'Bluetooth MIDI',
    'Carbon Action',
];

export const Filter: React.FC<FilterProps> = ({ onSearch, categories, isLoading }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Tất cả');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000000]);
    const [minRating, setMinRating] = useState(0);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false); // Mobile toggle

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch({
                query,
                category,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                minRating,
                features: selectedFeatures,
            });
        }, 800); // 1-second delay as requested

        return () => clearTimeout(timer);
    }, [query, category, priceRange, minRating, selectedFeatures, onSearch]);

    const handleFeatureToggle = (feature: string) => {
        setSelectedFeatures((prev) =>
            prev.includes(feature)
                ? prev.filter((f) => f !== feature)
                : [...prev, feature]
        );
    };

    const clearFilters = () => {
        setQuery('');
        setCategory('Tất cả');
        setPriceRange([0, 2000000000]);
        setMinRating(0);
        setSelectedFeatures([]);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 h-fit transition-colors sticky top-24">
            {/* Mobile Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center md:hidden">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FilterIcon className="w-5 h-5 text-primary" />
                    Tiêu chí lọc
                </h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <FilterIcon className="w-5 h-5" />}
                </button>
            </div>

            <div className={`p-6 space-y-8 ${isOpen ? 'block' : 'hidden'} md:block transition-all`}>
                {/* Search */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Tìm kiếm
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tên đàn, mô tả..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                        />
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        {isLoading && (
                            <div className="absolute right-3 top-3 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Loại đàn
                    </label>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="category"
                                    value={cat}
                                    checked={category === cat}
                                    onChange={() => setCategory(cat)}
                                    className="w-4 h-4 text-primary border-slate-300 focus:ring-primary focus:ring-offset-0 bg-gray-100 dark:bg-slate-700 dark:border-slate-600"
                                />
                                <span className={`text-sm ${category === cat ? 'text-primary font-medium' : 'text-slate-600 dark:text-slate-400'} group-hover:text-primary transition-colors`}>
                                    {cat}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                        Khoảng giá mua (VNĐ)
                    </label>
                    <DualRangeSlider
                        min={0}
                        max={2000000000}
                        step={100}
                        value={priceRange} // Passing current state
                        onChange={(vals) => setPriceRange(vals as [number, number])}
                        formatLabel={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val)}
                    />
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Đánh giá tối thiểu
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setMinRating(star === minRating ? 0 : star)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${minRating >= star
                                    ? 'bg-yellow-100 text-yellow-500 border border-yellow-300'
                                    : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-transparent'
                                    }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Tính năng
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {FEATURE_OPTIONS.map((feature) => (
                            <label key={feature} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedFeatures.includes(feature)}
                                    onChange={() => handleFeatureToggle(feature)}
                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-gray-100 dark:bg-slate-700 dark:border-slate-600"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Clear Button */}
                <GoldButton
                    onClick={clearFilters}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-none border border-transparent transition-colors !bg-none"
                >
                    Xóa bộ lọc
                </GoldButton>
            </div>
        </div>
    );
};
