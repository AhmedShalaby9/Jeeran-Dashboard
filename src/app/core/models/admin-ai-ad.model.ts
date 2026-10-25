// MODEL — an AI ad made by an admin in the app (an image to download, not a listing and not a banner)

export interface AdFact {
  key: string;
  label_en: string;
  label_ar?: string;
  detail_en?: string;
  source?: string;
}

export interface AdVariation {
  id: string;
  tone: string;
  head_en: string;
  sub_en: string;
  cta_en?: string;
  head_ar: string;
  sub_ar: string;
  cta_ar?: string;
  image_url: string | null;
  ai_image?: boolean;
  facts: AdFact[];
  fallback?: boolean;
}

export interface AdminAiAd {
  id: number;
  title: string;
  status: string;
  brief: { summary?: string; tone?: string; language?: string; width?: number; height?: number; size?: string };
  variations: AdVariation[];
  created_at: string;
}
