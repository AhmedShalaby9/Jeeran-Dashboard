// MODEL — defines the shape of package data

export interface Package {
  id: number;
  name: string;
  description: string;
  price: string;
  duration_days: number;
  available_listings: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageDto {
  name: string;
  price: number;
  duration_days: number;
  description?: string;
  available_listings?: number;
  features?: string[];
}

export interface PackagesResponse {
  success: boolean;
  data: Package[];
}
