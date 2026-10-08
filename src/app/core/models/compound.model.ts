// MODEL — defines the shape of compound data

import { Area } from './area.model';
import { Amenity, ListingAttributes } from './listing-options';
import { Promotion } from './promotion.model';

export interface CompoundFeature {
  title_ar:    string;
  title_en:    string;
  subtitle_ar: string;
  subtitle_en: string;
  images:      string[];
}

export interface CompoundDeveloper {
  id:       number;
  name_ar:  string;
  name_en:  string | null;
  logo:     string | null;
}

export interface Compound extends ListingAttributes {
  id:          number;
  developer_id: number;
  developer?:  CompoundDeveloper;
  area_id:     number | null;
  area?:       Area | null;
  amenities:   Amenity[] | null;
  /** The launch/offer running on this compound right now, if any. */
  promotion?:  Promotion | null;
  min_price?:  number | null;
  units_count?: number;
  followers_count?: number;
  facilities_ar?: string[] | null;
  facilities_en?: string[] | null;
  facts?: Record<string, string>[] | null;
  delivered_since?: number | null;
  name_ar:     string;
  name_en:     string;
  desc_ar:     string | null;
  desc_en:     string | null;
  main_image:  string | null;
  gallery:     string[];
  features:    CompoundFeature[];
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
}

export interface CreateCompoundDto extends ListingAttributes {
  developer_id: number | null;
  area_id:     number | null;
  amenities:   Amenity[] | null;
  name_ar:    string;
  name_en:    string;
  desc_ar?:   string | null;
  desc_en?:   string | null;
  main_image: string | null;
  gallery:    string[];
  features:   CompoundFeature[];
  is_active:  boolean;
  facilities_ar?: string[] | null;
  facilities_en?: string[] | null;
  facts?: Record<string, string>[] | null;
  delivered_since?: number | null;
}

export interface CompoundResponse {
  success: boolean;
  data: Compound[];
}
