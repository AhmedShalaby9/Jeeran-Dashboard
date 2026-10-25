export type CallRequestStatus = 'new' | 'contacted' | 'closed';

export interface CallRequest {
  id:              number;
  user_id:         number;
  property_id:     number;
  property_title?: string | null;
  reference_code?: string | null;
  price?:          string | number | null;
  status:          CallRequestStatus;
  contact_phone?:  string | null;
  phone_verified?: boolean;
  admin_note?:     string | null;
  handled_at?:     string | null;
  user?:     { id: number; name?: string; phone?: string; email?: string } | null;
  property?: { id: number; title_en?: string; title_ar?: string; listing_type?: string } | null;
  created_at: string;
}

export interface CallRequestPage {
  success: boolean;
  data:    CallRequest[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export type CallRequestCounts = Record<CallRequestStatus | 'all', number>;
