export interface PrivacyPolicy {
  content_en: string;
  content_ar: string;
  updated_at?: string;
}

export interface PrivacyPolicyResponse {
  success: boolean;
  data:    PrivacyPolicy;
}

export type UpdatePrivacyPolicyDto = Pick<PrivacyPolicy, 'content_en' | 'content_ar'>;
