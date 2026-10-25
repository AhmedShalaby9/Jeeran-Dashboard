// MODEL — an area people search by (North Coast, New Cairo …)

export type AreaState = 'cairo' | 'north_coast' | 'sharm_el_sheikh';

export const AREA_STATES: { value: AreaState; label: string }[] = [
  { value: 'cairo',           label: 'Cairo' },
  { value: 'north_coast',     label: 'North Coast' },
  { value: 'sharm_el_sheikh', label: 'Sharm El Sheikh' },
];

export interface Area {
  id:         number;
  name_ar:    string;
  name_en:    string | null;
  state:      AreaState | null;
  image:      string | null;
  sort_order: number;
  is_active:  boolean;
  listing_count?:   number;
  compounds_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAreaDto {
  name_ar:    string;
  name_en:    string;
  state:      AreaState | null;
  image:      string;
  sort_order: number;
  is_active:  boolean;
}

export interface AreaResponse {
  success: boolean;
  data: Area[];
}
