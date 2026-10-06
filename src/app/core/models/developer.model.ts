// MODEL — defines the shape of developer data

import { Project } from './project.model';

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
  projects?:  Project[];
  created_at: string;
  updated_at: string;
}

export interface CreateDeveloperDto {
  name_ar:    string;
  name_en:    string;
  logo:       string;
  desc_ar:    string;
  desc_en:    string;
  phone:      string;
  email:      string;
  website:    string;
  address:    string;
  facebook:   string;
  instagram:  string;
  twitter:    string;
  linkedin:   string;
  is_active:  boolean;
  is_verified: boolean;
}

export interface DeveloperResponse {
  success: boolean;
  data: Developer[];
}
