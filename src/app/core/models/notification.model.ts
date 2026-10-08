export type NotificationAudience = 'all' | 'registered_between' | 'user_type' | 'single_user';
export type NotificationType    = 'general' | 'subscription' | 'property' | 'project' | 'developer' | 'news' | 'ad';
/** What a user can switch off in the app (see the backend's notificationCategories). */
export type NotificationCategory = 'saved' | 'plan' | 'listing' | 'news' | 'ai' | 'place' | 'general';

export interface NotificationTarget {
  audience:  NotificationAudience;
  date_from?: string;
  date_to?:   string;
  user_type?: string;
  user_id?:   number;
}

export interface Notification {
  id:         number;
  title_en:   string;
  title_ar:   string;
  body_en:    string;
  body_ar:    string;
  type:       NotificationType;
  category?:  NotificationCategory;
  entity_id:  number | null;
  target:     NotificationTarget;
  created_at: string;
}

export interface SendNotificationDto {
  title_en:  string;
  title_ar:  string;
  body_en:   string;
  body_ar:   string;
  type:      NotificationType;
  category?: NotificationCategory;
  entity_id: number | null;
  target:    NotificationTarget;
}

/** Who a broadcast would reach, before sending it. */
export interface ReachPreview {
  category:              NotificationCategory;
  matched:               number;
  will_receive:          number;
  skipped_by_preference: number;
  without_push_token:    number;
}

export interface NotificationListResponse {
  success:    boolean;
  data:       Notification[];
  pagination?: { total: number; page: number; limit: number; total_pages: number };
  total?:      number;
}

export interface SendNotificationResponse {
  success: boolean;
  message?: string;
  data?: { skipped_by_preference?: number };
}
