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
  created_at: string;
  updated_at: string;
  projects?:  any[];
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
}

export interface DeveloperResponse {
  success: boolean;
  data:    Developer[];
}
