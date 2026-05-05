export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface SubscriptionUser {
  id: number;
  name: string;
  email: string;
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
  remaining_listings: number;
  start_date: string;
  end_date: string;
  created_at: string;
  user: SubscriptionUser;
  package: SubscriptionPackage;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  user_name?: string;
  package_id?: number;
  page?: number;
  limit?: number;
}

export interface SubscriptionsAdminResponse {
  success: boolean;
  data: Subscription[];
  pagination?: { total: number; page: number; limit: number; total_pages: number };
}
