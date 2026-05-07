export type SubscriptionStatus =
  | 'pending_payment'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'cancelled'
  | 'upgraded'
  | 'expired';

export interface SubscriptionUser {
  id: number;
  name: string;
  email: string | null;
  phone?: string;
}

export interface SubscriptionPackage {
  id: number;
  title_en: string | null;
  title_ar: string | null;
  price: string;
  duration_days: number;
  available_listings: number;
}

export interface Subscription {
  id: number;
  status: SubscriptionStatus;
  is_paid: boolean;
  payment_proof_url: string | null;
  available_listings: number;
  consumed_listings: number;
  remaining_listings: number;
  start_date: string | null;
  end_date: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  user: SubscriptionUser;
  package: SubscriptionPackage;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus | '';
  user_name?: string;
  package_id?: number;
  page?: number;
  limit?: number;
}

export interface SubscriptionsAdminResponse {
  success: boolean;
  data: Subscription[];
  pagination?: { total: number; page: number; limit: number; total_pages: number };
  meta?: { total: number; page: number; limit: number };
}
