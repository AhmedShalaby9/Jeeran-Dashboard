import { Property } from './property.model';

export interface FavoriteItem {
  id: number;
  user_id: number;
  property_id: number;
  created_at: string;
  property?: Property;
}

export interface AdminFavoriteItem {
  user_id: number;
  property_id: number;
  created_at: string;
  user?: { id: number; name: string; phone: string };
  property?: { id: number; title_ar: string; title_en: string; price: string; state: string };
}

export interface AdminFavoritesResponse {
  success: boolean;
  data: AdminFavoriteItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FavoritesResponse {
  success: boolean;
  data: FavoriteItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  total?: number;
}

export interface ToggleFavoriteDto {
  property_id: number;
}

export interface ToggleFavoriteResponse {
  success: boolean;
  message: string;
  data?: FavoriteItem;
}
