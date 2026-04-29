export interface DashboardStats {
  users: {
    total: number;
    buyers: number;
    sellers: number;
    admins: number;
    super_admins: number;
    active: number;
    inactive: number;
  };
  properties: {
    total: number;
    active: number;
    inactive: number;
    approved: number;
    pending: number;
    featured: number;
    expired: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
  };
  subscriptions: {
    total: number;
    active: number;
    expired: number;
    cancelled: number;
  };
  seller_requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  projects: {
    total: number;
    active: number;
  };
  news: {
    total: number;
    active: number;
  };
  banners: {
    total: number;
    active: number;
  };
  ads: {
    total: number;
    active: number;
  };
  favorites: {
    total: number;
  };
}

export interface StatsResponse {
  success: boolean;
  data: DashboardStats;
}
