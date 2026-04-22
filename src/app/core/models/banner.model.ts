// MODEL — defines the shape of banner data

export interface Banner {
  id: number;
  image_url: string;
  link: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerDto {
  image_url: string;
  link: string;
  phone: string;
  is_active: boolean;
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
}
