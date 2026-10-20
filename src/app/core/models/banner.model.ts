// MODEL — defines the shape of banner data
// A banner is media + caption + tap target, placed by `slot`.

export type BannerSlot   = 'explore_top' | 'explore_feed';
export type BannerKind   = 'internal' | 'sponsored';
export type BannerMedia  = 'image' | 'video';
export type BannerTarget =
  | 'none' | 'url' | 'phone'
  | 'property' | 'compound' | 'developer' | 'news'
  | 'ai_ads' | 'seller_signup';

export const BANNER_SLOTS: { value: BannerSlot; label: string; hint: string }[] = [
  { value: 'explore_top',  label: 'Explore · top rail', hint: 'Snapping rail under the search field (several creatives)' },
  { value: 'explore_feed', label: 'Explore · in-feed',  hint: 'One full-width slot after the featured listings' },
];

export const BANNER_TARGETS: { value: BannerTarget; label: string }[] = [
  { value: 'none',          label: 'Nothing (display only)' },
  { value: 'url',           label: 'Web link' },
  { value: 'phone',         label: 'Phone call' },
  { value: 'property',      label: 'Property' },
  { value: 'compound',       label: 'Compound (compound)' },
  { value: 'developer',     label: 'Developer' },
  { value: 'news',          label: 'News article' },
  { value: 'ai_ads',        label: 'AI ads screen' },
  { value: 'seller_signup', label: 'Add a property' },
];

/** Targets that point at a record and therefore need target_id. */
export const ID_TARGETS: BannerTarget[] = ['property', 'compound', 'developer', 'news'];

export interface Banner {
  id: number;
  image_url: string;
  link: string | null;
  phone: string | null;
  is_active: boolean;
  slot: BannerSlot;
  kind: BannerKind;
  media_type: BannerMedia;
  video_url: string | null;
  video_duration: number | null;
  caption_en: string | null;
  caption_ar: string | null;
  sub_en: string | null;
  sub_ar: string | null;
  target_type: BannerTarget;
  target_id: number | null;
  sponsor_name: string | null;
  developer_id: number | null;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  /** Ad studio: the facts the ad quotes, where they come from, and the pause state. */
  ad_facts?: AdFact[] | null;
  ad_scope?: { compound_id: number | null; developer_id: number | null } | null;
  ad_paused_at?: string | null;
  ad_pause?: { at: string; changes: AdChange[] } | null;
  created_at: string;
  updated_at: string;
}

/** A fact an Ad-studio ad quotes: computed from live data, with its source. */
export interface AdFact {
  key: string;
  label_en: string;
  label_ar?: string;
  detail_en?: string;
  source?: string;
}

/** A quoted number that changed while the ad was running. */
export interface AdChange {
  key: string;
  was: string;
  now: string | null;
}

export type BannerStatus = 'live' | 'scheduled' | 'ended' | 'off' | 'paused';

/** What an admin sees: running, waiting for its start date, past its end date, switched off, or paused for a changed number. */
export function bannerStatus(b: Banner, now = new Date()): BannerStatus {
  if (!b.is_active) return 'off';
  if (b.ad_paused_at) return 'paused';
  if (b.starts_at && new Date(b.starts_at) > now) return 'scheduled';
  if (b.ends_at && new Date(b.ends_at) < now) return 'ended';
  return 'live';
}

export const BANNER_STATUS_LABEL: Record<BannerStatus, string> = {
  live: 'Live', scheduled: 'Scheduled', ended: 'Ended', off: 'Off', paused: 'Paused',
};

/** Made in the Ad studio (it quotes facts). */
export function isStudioAd(b: Banner): boolean {
  return Array.isArray(b.ad_facts) && b.ad_facts.length > 0 || !!b.ad_scope;
}

/** An AI draft: three variations waiting for an admin to pick one in the app. */
export interface AdVariation {
  id: string;
  tone: string;
  head_en: string;
  sub_en: string;
  head_ar: string;
  sub_ar: string;
  image_url: string | null;
  facts: AdFact[];
  fallback?: boolean;
}

export interface AdDraft {
  id: number;
  title: string;
  status: string;
  brief: { summary?: string; slot?: string; tone?: string; language?: string; sponsor?: { id: number; name: string } | null };
  variations: AdVariation[];
  created_at: string;
}

/** Editable fields. Dates are `datetime-local` strings in the form, ISO on the wire. */
export interface CreateBannerDto {
  image_url: string;
  link: string;
  phone: string;
  is_active: boolean;
  slot: BannerSlot;
  kind: BannerKind;
  media_type: BannerMedia;
  video_url: string;
  video_duration: number | null;
  caption_en: string;
  caption_ar: string;
  sub_en: string;
  sub_ar: string;
  target_type: BannerTarget;
  target_id: number | null;
  sponsor_name: string;
  developer_id: number | null;
  sort_order: number;
  starts_at: string;
  ends_at: string;
}

export function emptyBannerForm(): CreateBannerDto {
  return {
    image_url: '', link: '', phone: '', is_active: true,
    slot: 'explore_top', kind: 'internal', media_type: 'image',
    video_url: '', video_duration: null,
    caption_en: '', caption_ar: '', sub_en: '', sub_ar: '',
    target_type: 'none', target_id: null,
    sponsor_name: '', developer_id: null,
    sort_order: 0, starts_at: '', ends_at: '',
  };
}

/** ISO string from the API → value for <input type="datetime-local">. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function bannerToForm(b: Banner): CreateBannerDto {
  return {
    image_url: b.image_url, link: b.link ?? '', phone: b.phone ?? '', is_active: b.is_active,
    slot: b.slot, kind: b.kind, media_type: b.media_type,
    video_url: b.video_url ?? '', video_duration: b.video_duration,
    caption_en: b.caption_en ?? '', caption_ar: b.caption_ar ?? '',
    sub_en: b.sub_en ?? '', sub_ar: b.sub_ar ?? '',
    target_type: b.target_type, target_id: b.target_id,
    sponsor_name: b.sponsor_name ?? '', developer_id: b.developer_id,
    sort_order: b.sort_order,
    starts_at: toLocalInput(b.starts_at), ends_at: toLocalInput(b.ends_at),
  };
}

/** Form → API payload: empty strings/dates become null so the server clears them. */
export function bannerPayload(f: CreateBannerDto): Record<string, unknown> {
  const blank = (v: string) => (v && v.trim() ? v.trim() : null);
  return {
    image_url: f.image_url.trim(),
    link: blank(f.link), phone: blank(f.phone), is_active: f.is_active,
    slot: f.slot, kind: f.kind, media_type: f.media_type,
    video_url: f.media_type === 'video' ? blank(f.video_url) : null,
    video_duration: f.media_type === 'video' ? f.video_duration : null,
    caption_en: blank(f.caption_en), caption_ar: blank(f.caption_ar),
    sub_en: blank(f.sub_en), sub_ar: blank(f.sub_ar),
    target_type: f.target_type,
    target_id: ID_TARGETS.includes(f.target_type) ? f.target_id : null,
    sponsor_name: f.kind === 'sponsored' ? blank(f.sponsor_name) : null,
    developer_id: f.kind === 'sponsored' ? f.developer_id : null,
    sort_order: Number(f.sort_order) || 0,
    starts_at: f.starts_at ? new Date(f.starts_at).toISOString() : null,
    ends_at: f.ends_at ? new Date(f.ends_at).toISOString() : null,
  };
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
}
