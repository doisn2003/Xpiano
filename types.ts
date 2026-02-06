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
}
