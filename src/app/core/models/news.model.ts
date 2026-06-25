// MODEL — defines the shape of news data

export interface News {
  id: number;
  title: string;           // computed fallback from API
  title_ar: string | null;
  title_en: string | null;
  content: string;         // computed fallback from API
  content_ar: string | null;
  content_en: string | null;
  media: string[];
  is_active: boolean;
  published_at: string;
  published_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNewsDto {
  title_ar: string | null;
  title_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  media: string[];
  is_active: boolean;
  published_at: string;
  published_by: string;
}

export interface NewsResponse {
  success: boolean;
  data: News[];
}
