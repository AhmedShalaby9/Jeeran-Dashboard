export interface Ad {
  id: number;
  title_en: string;
  title_ar: string | null;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  images: string[];
  phone_number: string;
  whatsapp_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdDto {
  title_en: string;
  title_ar: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  images: string[];
  phone_number: string;
  whatsapp_number: string;
  is_active: boolean;
}

export interface AdResponse {
  success: boolean;
  data: Ad[];
}
