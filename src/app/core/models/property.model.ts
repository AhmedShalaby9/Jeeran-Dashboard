// MODEL — defines the shape of property data

import { Amenity, Finishing, PaymentOption } from './listing-options';

export type PropertyType =
  | 'villa'
  | 'apartment'
  | 'chalet'
  | 'marina_apartment'
  | 'clinic'
  | 'office'
  | 'shop'
  | 'twinhouse'
  | 'townhouse'
  | 'duplex'
  | 'studio'
  | 'land';

export type PropertyStatus =
  | 'for_sale'
  | 'for_rent'
  | 'for_rent_furnished';

export type ListingType = 'primary' | 'resale';

export const LISTING_TYPE_LABELS: Record<ListingType, { en: string; ar: string }> = {
  primary: { en: 'Primary',  ar: 'أساسي'      },
  resale:  { en: 'Resale',   ar: 'إعادة بيع'  },
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, { en: string; ar: string }> = {
  villa:            { en: 'Villa',            ar: 'فيلا'          },
  apartment:        { en: 'Apartment',        ar: 'شقة'           },
  chalet:           { en: 'Chalet',           ar: 'شاليه'         },
  marina_apartment: { en: 'Marina Apartment', ar: 'شقة بالمارينا' },
  clinic:           { en: 'Clinic',           ar: 'عيادة'         },
  office:           { en: 'Office',           ar: 'مكتب إداري'    },
  shop:             { en: 'Shop',             ar: 'محل'           },
  twinhouse:        { en: 'Twinhouse',        ar: 'توين هاوس'     },
  townhouse:        { en: 'Townhouse',        ar: 'تاون هاوس'     },
  duplex:           { en: 'Duplex',           ar: 'دوبلكس'        },
  studio:           { en: 'Studio',           ar: 'استوديو'       },
  land:             { en: 'Land',             ar: 'أرض'           },
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, { en: string; ar: string }> = {
  for_sale:           { en: 'For Sale',             ar: 'للبيع'         },
  for_rent:           { en: 'For Rent',             ar: 'للإيجار'       },
  for_rent_furnished: { en: 'For Rent (Furnished)', ar: 'للإيجار مفروش' },
};

/** What a buyer actually sees for a unit: its own value, else its compound's. */
export interface EffectiveAttributes {
  delivery_date:        string | null;
  is_ready:             boolean | null;
  finishing:            Finishing | null;
  payment_options:      PaymentOption[] | null;
  down_payment_percent: number | null;
  installment_years:    number | null;
  amenities:            Amenity[];
}

export interface Property {
  id:               number;
  legacy_id:        number | null;
  legacy_code:      string | null;
  title:            string;
  title_ar:         string | null;
  title_en:         string | null;
  slug:             string;
  content:          string | null;
  content_ar:       string | null;
  content_en:       string | null;
  content_html:     string | null;
  property_type:    string;
  property_status:  string;
  listing_type:     string;
  price:            number;
  size:             number | null;
  bedrooms:         number | null;
  bathrooms:        number | null;
  country:          string | null;
  state:            string | null;
  compound_id:       number | null;
  phase_id?:         number | null;
  phase?:            { id: number; name_ar: string; name_en: string | null } | null;
  delivery_date?:        string | null;
  finishing?:            Finishing | null;
  payment_options?:      PaymentOption[] | null;
  down_payment_percent?: number | null;
  installment_years?:    number | null;
  features?:             Amenity[] | null;
  effective?:            EffectiveAttributes;
  garden_size?:     number | null;
  level_ar?:        string | null;
  level_en?:        string | null;
  floor_plan?:      string | null;
  maintenance_ar?:  string | null;
  maintenance_en?:  string | null;
  reference_code?:  string | null;
  price_per_m2?:    number | null;
  images:           string[];
  video_url:        string | null;
  is_featured:      boolean;
  is_active:        boolean;
  is_approved:      boolean | null;
  published_at:     string | null;
  views_count:      number;
  sold_at?:         string | null;
  saves_count?:     number;
  agent_name:       string | null;
  agent_mobile:     string | null;
  agent_whatsapp:   string | null;
  agent_email:      string | null;
  agent_picture:    string | null;
  created_at:       string;
  updated_at:       string;
}

export interface CreatePropertyDto {
  legacy_id?:       number | null;
  legacy_code?:     string | null;
  title?:           string | null;
  title_ar?:        string | null;
  title_en?:        string | null;
  slug:             string;
  content?:         string | null;
  content_ar?:      string | null;
  content_en?:      string | null;
  content_html?:    string | null;
  property_type:    string;
  property_status:  string;
  listing_type?:    string;
  price:            number;
  size?:            number | null;
  bedrooms?:        number | null;
  bathrooms?:       number | null;
  country?:         string | null;
  state?:           string | null;
  compound_id?:      number | null;
  phase_id?:         number | null;
  delivery_date?:        string | null;
  finishing?:            Finishing | null;
  payment_options?:      PaymentOption[] | null;
  down_payment_percent?: number | null;
  installment_years?:    number | null;
  features?:             Amenity[] | null;
  images:           string[];
  garden_size?:     number | null;
  level_ar?:        string | null;
  level_en?:        string | null;
  floor_plan?:      string | null;
  maintenance_ar?:  string | null;
  maintenance_en?:  string | null;
  video_url?:       string | null;
  is_featured:      boolean;
  is_active:        boolean;
  published_at?:    string | null;
  views_count?:     number;
  agent_name?:      string | null;
  agent_mobile?:    string | null;
  agent_whatsapp?:  string | null;
  agent_email?:     string | null;
  agent_picture?:   string | null;
}

export interface PropertyPagination {
  page:  number;
  limit: number;
  total: number;
  pages: number;
  sort?: string;
  order?: string;
}

export interface PropertyListResponse {
  success:     boolean;
  data:        Property[];
  pagination?: PropertyPagination;
  // legacy flat fields (fallback)
  total?:      number;
  page?:       number;
  limit?:      number;
}

export interface PropertyResponse {
  success: boolean;
  data:    Property;
}
