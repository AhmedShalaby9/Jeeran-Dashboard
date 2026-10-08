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
  { value: 'seller_signup', label: 'Seller sign-up' },
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
  created_at: string;
  updated_at: string;
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
