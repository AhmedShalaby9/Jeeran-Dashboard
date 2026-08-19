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

export interface Project {
  id:           number;
  developer_id: number;
  name_ar:      string;
  name_en:      string;
  desc_ar:      string | null;
  desc_en:      string | null;
  main_image:   string | null;
  gallery:      string[];
  features:     ProjectFeature[];
  is_active:    boolean;
  created_at:   string;
  updated_at:   string;
  developer?:   ProjectDeveloper;
}

export interface CreateProjectDto {
  developer_id: number;
  name_ar:      string;
  name_en:      string;
  desc_ar?:     string | null;
  desc_en?:     string | null;
  main_image:   string | null;
  gallery:      string[];
  features:     ProjectFeature[];
  is_active:    boolean;
}

export interface ProjectResponse {
  success: boolean;
  data: Project[];
}
