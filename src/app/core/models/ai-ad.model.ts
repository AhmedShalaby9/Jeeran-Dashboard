export interface AiAdUser {
  id: number;
  name: string | null;
  phone: string;
  email: string | null;
}

export interface AiAd {
  id: number;
  user_id: number;
  parent_id: number | null;
  trial_number: number | null;
  caption: string;
  source_images: string[];
  generated_image_url: string | null;
  status: 'awaiting_payment' | 'pending' | 'done' | 'failed';
  payment_status: 'unpaid' | 'paid' | 'failed';
  payment_order_id: string | null;
  error_message: string | null;
  duration_ms: number | null;
  model: string | null;
  created_at: string;
  updated_at: string;
  user?: AiAdUser;
}

export interface AiAdsResponse {
  success: boolean;
  data: AiAd[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    sort: string;
    order: string;
  };
}
