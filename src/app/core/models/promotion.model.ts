// MODEL — a compound's marketing state: a launch or an offer

import { Compound } from './compound.model';

export type PromotionType = 'launch' | 'offer';

export interface Promotion {
  id:             number;
  compound_id:    number;
  type:           PromotionType;
  title_ar:       string | null;
  title_en:       string | null;
  sub_ar:         string | null;
  sub_en:         string | null;
  image:          string | null;
  video_url:      string | null;
  video_duration: number | null;
  starts_at:      string;
  ends_at:        string | null;
  is_active:      boolean;
  sort_order:     number;
  compound?:      Compound;
  created_at:     string;
  updated_at:     string;
}

export interface CreatePromotionDto {
  compound_id:    number | null;
  type:           PromotionType;
  title_ar:       string;
  title_en:       string;
  sub_ar:         string;
  sub_en:         string;
  image:          string;
  video_url:      string;
  video_duration: number | null;
  starts_at:      string;   // datetime-local value
  ends_at:        string;   // datetime-local value, '' = none
  is_active:      boolean;
  sort_order:     number;
}

export type PromotionStatus = 'live' | 'scheduled' | 'ended' | 'off';

/** Where a promotion is in its life, for badges. */
export function promotionStatus(p: Promotion, now = new Date()): PromotionStatus {
  if (!p.is_active) return 'off';
  if (new Date(p.starts_at) > now) return 'scheduled';
  if (p.ends_at && new Date(p.ends_at) < now) return 'ended';
  return 'live';
}

export interface PromotionResponse {
  success: boolean;
  data: Promotion[];
}
