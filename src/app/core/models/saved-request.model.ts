export type SavedRequestState = 'active' | 'cancelled' | 'expired';

export interface SavedRequestFilters {
  property_type?:   string;
  property_status?: string;
  listing_type?:    string;
  country?:         string;
  state?:           string;
  compound_id?:     number;
  developer_id?:    number;
  min_price?:       number;
  max_price?:       number;
  min_size?:        number;
  max_size?:        number;
  bedrooms?:        number;
  bathrooms?:       number;
  q?:               string;
}

export interface SavedRequestUnit {
  id:             number;
  title_en?:      string | null;
  title_ar?:      string | null;
  price?:         string | number | null;
  property_type?: string;
  listing_type?:  string;
  reference_code?: string | null;
}

export interface SavedRequest {
  id:               number;
  user_id:          number;
  filters:          SavedRequestFilters;
  original_text?:   string | null;
  lang:             string;
  status:           'active' | 'cancelled';
  state:            SavedRequestState;
  expires_at:       string;
  last_notified_at?: string | null;
  handled_at?:      string | null;
  admin_note?:      string | null;
  created_at:       string;
  matches_count?:   number;
  notified_count?:  number;
  compound?:  { id: number; name_en?: string; name_ar?: string } | null;
  developer?: { id: number; name_en?: string; name_ar?: string } | null;
  user?: { id: number; name?: string; phone?: string; email?: string; phone_verified?: boolean } | null;
  matches?:       { id: number; notified: boolean; created_at: string; property?: SavedRequestUnit | null }[];
  available_now?: SavedRequestUnit[];
}

export interface SavedRequestPage {
  success: boolean;
  data:    SavedRequest[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface SavedRequestCounts {
  active: number; cancelled: number; expired: number; all: number;
  unhandled: number; new_7d: number; matched: number;
}

export interface SavedRequestInsights {
  active_requests: number;
  without_stock:   number;
  top: { property_type: string | null; property_status: string | null; place: string; budget: string; requests: number; no_stock: number }[];
}
