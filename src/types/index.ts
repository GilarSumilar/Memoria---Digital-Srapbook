export type CoverColor = 
  | 'burgundy' 
  | 'navy' 
  | 'forest' 
  | 'charcoal' 
  | 'terracotta' 
  | 'sand' 
  | 'sage' 
  | 'midnight';

export type CoverTexture = 'linen' | 'leather' | 'smooth' | 'vintage';

export type PageLayout = 
  | 'single'          // 1 large photo with caption below
  | 'single-full'     // 1 photo full bleed
  | 'split-v'         // 2 photos vertical split
  | 'split-h'         // 2 photos horizontal split
  | 'polaroid'        // 1 or 2 polaroid cards tilted with tape
  | 'collage-3'       // 3 photos artistic collage
  | 'grid-4'          // 4 photos 2x2 grid
  | 'story';          // Photo on top/left, rich story journal text below/right

export type PhotoFilter = 'normal' | 'vintage' | 'warm' | 'cool' | 'sepia' | 'grayscale';

export interface PhotoItem {
  id: string;
  url: string;               // Base64 or Supabase/external URL
  thumbnailUrl?: string;
  caption?: string;
  story?: string;
  date?: string;             // YYYY-MM-DD or readable string
  filter?: PhotoFilter;
  rotation?: number;         // For slight organic tilt in polaroid
}

export interface BookPage {
  id: string;
  pageNumber: number;        // 1-based (Page 1, 2, 3...)
  layout: PageLayout;
  photos: PhotoItem[];
  title?: string;
  journalText?: string;      // Used for 'story' layout
  backgroundColor?: string;  // e.g. '#FAF8F5' (Ivory), '#F4EFEA' (Warm Linen)
}

export interface Album {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  coverColor: CoverColor;
  coverTexture: CoverTexture;
  coverImage?: string;       // Optional custom cover artwork / thumbnail
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  pages: BookPage[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}
