// MODEL — a phase of a compound (Marina Rise, Bayside …)

export type PhaseStatus = 'selling_now' | 'resale_only' | 'sold_out' | 'coming_soon';

export interface Phase {
  id:                number;
  compound_id:       number;
  name_ar:           string;
  name_en:           string | null;
  delivery_label_ar: string | null;
  delivery_label_en: string | null;
  sort_order:        number;
  is_active:         boolean;
  // derived from the units
  available_count?:  number;
  primary_count?:    number;
  resale_count?:     number;
  sold_count?:       number;
  min_price?:        number | null;
  status?:           PhaseStatus;
}

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  selling_now: 'Selling now',
  resale_only: 'Resale only',
  sold_out:    'Sold out',
  coming_soon: 'Coming soon',
};
