export type TargetType     = 'all' | 'user_type' | 'user';
export type TargetUserType = 'driver' | 'vendor' | 'admin' | 'super_admin' | 'fleet' | 'delivery_company';

export interface Notification {
  id:               number;
  title:            string;
  body:             string;
  data:             Record<string, unknown> | null;
  target_type:      TargetType;
  target_user_type: TargetUserType | null;
  target_user_id:   number | null;
  sent_by:          number;
  sender:           { id: number; name: string } | null;
  target_user:      { id: number; name: string } | null;
  created_at:       string;
}

export interface UserNotification {
  id:              number;   // user_notification row id — use this for mark-read
  notification_id: number;
  is_read:         boolean;
  read_at:         string | null;
  notification: {
    id:         number;
    title:      string;
    body:       string;
    data:       Record<string, unknown> | null;
    created_at: string;
  };
}

export interface Pagination {
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

export interface NotificationListResponse {
  data: {
    notifications: Notification[];
    pagination:    Pagination;
  };
}

export interface UserNotificationListResponse {
  data: {
    notifications: UserNotification[];
    pagination:    Pagination;
  };
}

export interface SendNotificationDto {
  title:             string;
  body:              string;
  data?:             Record<string, unknown>;
  target_type:       TargetType;
  target_user_type?: TargetUserType;
  target_user_id?:   number;
}

export interface SendNotificationResponse {
  data: { notification: Notification };
}

export interface UnreadCountResponse {
  data: { unread_count: number };
}
