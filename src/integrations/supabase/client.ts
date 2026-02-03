import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jctmxknklxyisydtsmfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdG14a25rbHh5aXN5ZHRzbWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzkxODIsImV4cCI6MjA4NTY1NTE4Mn0.DX2_JVTtRRTeVejnyzNQEfMQYw5Stkaafmmrz_qBXtw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types for database tables
export type UserRole = 'admin' | 'editor';

export interface Profile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  category: string | null;
  image_url: string | null;
  status: 'draft' | 'published';
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  start_dt: string;
  end_dt: string | null;
  location: string | null;
  locale: string;
  created_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  tier: 'main' | 'partner' | 'supporter';
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Download {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  created_at: string;
}

export interface MediaAlbum {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export interface MediaFile {
  id: string;
  album_id: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  created_at: string;
}
