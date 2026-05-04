// MODEL — defines the shape of package data

export interface Package {
  id: number;
  title_en: string | null;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  price: string;
  duration_days: number;
  available_listings: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageDto {
  title_en: string;
  title_ar: string;
  price: number;
  duration_days: number;
  description_en?: string | null;
  description_ar?: string | null;
  available_listings?: number;
  features?: string[];
}

export interface PackagesResponse {
  success: boolean;
  data: Package[];
}
