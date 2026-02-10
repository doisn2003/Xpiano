// Backend Piano type
export interface Piano {
  id: number;
  name: string;
  image_url: string;
  category: string;
  price_per_day: number;
  price?: number; // Giá bán (nullable - nếu chỉ cho thuê)
  rating: number;
  reviews_count: number;
  description: string;
  features: string[];
  created_at?: string;
}

// Legacy Product type (for compatibility)
export interface Product {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  badgeColor?: string;
  category?: string;
  description?: string;
  features?: string[];
}
