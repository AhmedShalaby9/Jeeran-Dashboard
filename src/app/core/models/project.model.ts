// MODEL — defines the shape of project data

export interface ProjectFeature {
  title_ar:    string;
  title_en:    string;
  subtitle_ar: string;
  subtitle_en: string;
  images:      string[];
}

export interface ProjectDeveloper {
  id:       number;
  name_ar:  string;
  name_en:  string | null;
  logo:     string | null;
}

export type ProjectState = 'cairo' | 'north_coast' | 'sharm_el_sheikh';

export const PROJECT_STATES: { value: ProjectState; label: string }[] = [
  { value: 'cairo',           label: 'Cairo' },
  { value: 'north_coast',     label: 'North Coast' },
  { value: 'sharm_el_sheikh', label: 'Sharm El Sheikh' },
];

export interface Project {
  id:          number;
  developer_id: number;
  developer?:  ProjectDeveloper;
  is_new_launch: boolean;
  launched_at: string | null;
  state:       ProjectState | null;
  area_ar:     string | null;
  area_en:     string | null;
  min_price?:  number | null;
  units_count?: number;
  followers_count?: number;
  name_ar:     string;
  name_en:     string;
  desc_ar:     string | null;
  desc_en:     string | null;
  main_image:  string | null;
  gallery:     string[];
  features:    ProjectFeature[];
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
}

export interface CreateProjectDto {
  developer_id: number | null;
  is_new_launch: boolean;
  launched_at: string | null;
  state:       ProjectState | null;
  area_ar:     string | null;
  area_en:     string | null;
  name_ar:    string;
  name_en:    string;
  desc_ar?:   string | null;
  desc_en?:   string | null;
  main_image: string | null;
  gallery:    string[];
  features:   ProjectFeature[];
  is_active:  boolean;
}

export interface ProjectResponse {
  success: boolean;
  data: Project[];
}
