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

/** A question and answer, in both languages (the assistant and the app read these). */
export interface CompoundFaq {
  question_en: string;
  answer_en:   string;
  question_ar: string | null;
  answer_ar:   string | null;
}

/** What the importer keeps in additional_info (all optional: hand-made compounds have none of it). */
export interface CompoundAdditionalInfo {
  source?:         { name?: string; id?: number; url?: string; scraped_at?: string };
  location?:       { area_en?: string; parent_area_en?: string | null };
  market?:         { as_of?: string; currency?: string; developer_starting_price?: number | null; resale_starting_price?: number | null; note?: string };
  property_types?: { type: string; count: number }[];
  [key: string]:   unknown;
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
  /** Reference id from the source the compound was imported from; unique. */
  nawy_id?:      number | null;
  latitude?:     number | string | null;
  longitude?:    number | string | null;
  /** GeoJSON polygon of the compound's boundary (kept for a later map). */
  boundary?:     { type: string; coordinates: unknown } | null;
  master_plan?:  string | null;
  brochure_url?: string | null;
  faqs?:         CompoundFaq[] | null;
  /** Other spellings of the name, typed or spoken. */
  aliases?:      string[] | null;
  additional_info?: CompoundAdditionalInfo | null;
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
  latitude?:     number | null;
  longitude?:    number | null;
  master_plan?:  string | null;
  brochure_url?: string | null;
  faqs?:         CompoundFaq[] | null;
  aliases?:      string[] | null;
}

export interface CompoundResponse {
  success: boolean;
  data: Compound[];
}
