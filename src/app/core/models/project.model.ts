// MODEL — defines the shape of project data

export interface ProjectFeature {
  title_ar:    string;
  title_en:    string;
  subtitle_ar: string;
  subtitle_en: string;
  desc_ar:     string;
  desc_en:     string;
  images:      string[];
}

export interface Project {
  id:          number;
  name_ar:     string;
  name_en:     string;
  main_image:  string | null;
  gallery:     string[];
  features:    ProjectFeature[];
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
}

export interface CreateProjectDto {
  name_ar:    string;
  name_en:    string;
  main_image: string | null;
  gallery:    string[];
  features:   ProjectFeature[];
  is_active:  boolean;
}

export interface ProjectResponse {
  success: boolean;
  data: Project[];
}
