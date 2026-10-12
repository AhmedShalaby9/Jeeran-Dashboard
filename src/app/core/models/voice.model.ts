// MODEL — voice messages (recorded questions sent to the AI assistant)

export interface VoiceUser {
  id:    number;
  name:  string;
  phone: string;
  email: string;
}

export interface VoiceMessage {
  id:                  number;
  user_id:             number;
  audio_url:           string | null;
  duration_seconds:    number | null;
  requested_language:  'ar' | 'en' | null;
  detected_language:   'ar' | 'en' | null;
  transcript:          string | null;
  status:              'pending' | 'done' | 'failed';
  error_message:       string | null;
  created_at:          string;
  updated_at:          string;
  user:                VoiceUser;
}

export interface Pagination {
  page:   number;
  limit:  number;
  total:  number;
  pages:  number;
  sort:   string;
  order:  string;
}

export interface VoiceMessagesResponse {
  success:    boolean;
  pagination: Pagination;
  data:       VoiceMessage[];
}
