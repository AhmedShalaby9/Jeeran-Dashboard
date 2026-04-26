// MODEL — defines the shape of property data

export interface Property {
  id:               number;
  legacy_id:        number | null;
  legacy_code:      string | null;
  title:            string;
  slug:             string;
  content:          string | null;
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
  title:            string;
  slug:             string;
  content?:         string | null;
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
