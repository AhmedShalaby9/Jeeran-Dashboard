export type NotificationAudience = 'all' | 'registered_between' | 'user_type' | 'single_user';
export type NotificationType    = 'general' | 'subscription' | 'property';

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
  entity_id: number | null;
  target:    NotificationTarget;
}

export interface NotificationListResponse {
  success:    boolean;
  data:       Notification[];
  pagination?: { total: number; page: number; limit: number; total_pages: number };
  total?:      number;
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
}
