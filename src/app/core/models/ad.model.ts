// MODEL — defines the shape of ad data

export interface Ad {
  id: number;
  title: string;
  name: string;
  description: string;
  images: string[];
  phone_number: string;
  whatsapp_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdDto {
  title: string;
  name: string;
  description: string;
  images: string[];
  phone_number: string;
  whatsapp_number: string;
  is_active: boolean;
}

export interface AdResponse {
  success: boolean;
  data: Ad[];
}
