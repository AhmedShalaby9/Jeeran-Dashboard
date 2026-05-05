// MODEL — defines the shape of property data

export type PropertyType =
  | 'villa'
  | 'apartment'
  | 'chalet'
  | 'marina_apartment'
  | 'studio'
  | 'duplex'
  | 'land'
  | 'clinic'
  | 'office'
  | 'shop';

export type PropertyStatus =
  | 'for_sale'
  | 'for_rent'
  | 'for_rent_furnished';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, { en: string; ar: string }> = {
  villa:            { en: 'Villa',            ar: 'فيلا'       },
  apartment:        { en: 'Apartment',        ar: 'شقة'        },
  chalet:           { en: 'Chalet',           ar: 'شاليه'      },
  marina_apartment: { en: 'Marina Apartment', ar: 'شقة مارينا' },
  studio:           { en: 'Studio',           ar: 'استوديو'    },
  duplex:           { en: 'Duplex',           ar: 'دوبلكس'     },
  land:             { en: 'Land',             ar: 'أرض'        },
  clinic:           { en: 'Clinic',           ar: 'عيادة'      },
  office:           { en: 'Office',           ar: 'مكتب'       },
  shop:             { en: 'Shop',             ar: 'محل'        },
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, { en: string; ar: string }> = {
  for_sale:           { en: 'For Sale',             ar: 'للبيع'         },
  for_rent:           { en: 'For Rent',             ar: 'للإيجار'       },
  for_rent_furnished: { en: 'For Rent (Furnished)', ar: 'للإيجار مفروش' },
};

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
  price:            number;
  size:             number | null;
  bedrooms:         number | null;
  bathrooms:        number | null;
  country:          string | null;
  state:            string | null;
  project_id:       number | null;
  images:           string[];
  video_url:        string | null;
  is_featured:      boolean;
  is_active:        boolean;
  is_approved:      boolean | null;
  published_at:     string | null;
  views_count:      number;
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
  price:            number;
  size?:            number | null;
  bedrooms?:        number | null;
  bathrooms?:       number | null;
  country?:         string | null;
  state?:           string | null;
  project_id?:      number | null;
  images:           string[];
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
