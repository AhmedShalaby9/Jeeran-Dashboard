export interface Developer {
  id:         number;
  name_ar:    string;
  name_en:    string | null;
  logo:       string | null;
  desc_ar:    string | null;
  desc_en:    string | null;
  phone:      string | null;
  email:      string | null;
  website:    string | null;
  address:    string | null;
  facebook:   string | null;
  instagram:  string | null;
  twitter:    string | null;
  linkedin:   string | null;
  is_active:  boolean;
  is_verified?: boolean;
  verified_at?: string | null;
  followers_count?: number;
  cover_image?: string | null;
  founded_year?: number | null;
  stock_listing?: string | null;
  delivered_units?: number | null;
  trust_items?: Record<string, string>[] | null;
  created_at: string;
  updated_at: string;
  compounds?:  any[];
}

export interface CreateDeveloperDto {
  name_ar:    string;
  name_en?:   string | null;
  logo?:      string | null;
  desc_ar?:   string | null;
  desc_en?:   string | null;
  phone?:     string | null;
  email?:     string | null;
  website?:   string | null;
  address?:   string | null;
  facebook?:  string | null;
  instagram?: string | null;
  twitter?:   string | null;
  linkedin?:  string | null;
  is_active?: boolean;
  is_verified?: boolean;
  cover_image?: string | null;
  founded_year?: number | null;
  stock_listing?: string | null;
  delivered_units?: number | null;
  trust_items?: Record<string, string>[] | null;
}

export interface DeveloperResponse {
  success: boolean;
  data:    Developer[];
}
