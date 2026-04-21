// MODEL — defines the shape of news data

export interface News {
  id: number;
  title: string;
  content: string;
  media: string[];
  is_active: boolean;
  published_at: string;
  published_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNewsDto {
  title: string;
  content: string;
  media: string[];
  is_active: boolean;
  published_at: string;
  published_by: string;
}

export interface NewsResponse {
  success: boolean;
  data: News[];
}
