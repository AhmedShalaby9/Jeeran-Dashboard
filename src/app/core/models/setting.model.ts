export interface AppSettings {
  min_version_ios:      string;
  min_version_android:  string;
  app_store_url:        string;
  google_play_url:      string;
  terms_en:             string;
  terms_ar:             string;
  about_us_en:          string;
  about_us_ar:          string;
  privacy_policy_en:    string;
  privacy_policy_ar:    string;
  ad_generation_price:  number;
  ad_generation_trials: number;
  in_review: boolean;
  promo_ai_ads_visible: boolean;
  promo_seller_visible: boolean;
  promo_ai_ads_order: number;
  promo_seller_order: number;
  ai_guide_video_url?: string;
  ai_guide_video_visible: boolean;
}

export interface SettingsResponse {
  success: boolean;
  data: AppSettings;
}

export type UpdateSettingsDto = Partial<AppSettings>;
