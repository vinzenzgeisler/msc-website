import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

export interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  locale: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  updated_at: string;
}

// Default content structure for each page
export const PAGE_SECTIONS = {
  home: ['hero', 'club_teaser'],
  about: ['intro', 'mission', 'values'],
  board: ['intro', 'members'],
  history: ['intro', 'timeline'],
  membership: ['intro', 'benefits', 'how_to_join'],
  motocross: ['intro', 'training', 'events'],
  trial: ['intro', 'training', 'events'],
  touring: ['intro', 'tours', 'community'],
  imprint: ['content'],
  privacy: ['content'],
} as const;

export type PageKey = keyof typeof PAGE_SECTIONS;

// Helper hook to get a specific section's content
export function useSectionContent(pageKey: PageKey, sectionKey: string) {
  const { locale } = useLanguage();
  
  return useQuery({
    queryKey: ['page_content', pageKey, sectionKey, locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .eq('section_key', sectionKey)
        .eq('locale', locale)
        .maybeSingle();
      
      if (error) {
        // If table doesn't exist, return null
        if (error.code === '42P01') {
          return null;
        }
        throw error;
      }
      
      return data as PageContent | null;
    },
  });
}

// Helper to get content with fallback
export function useContentWithFallback(
  pageKey: PageKey, 
  sectionKey: string, 
  fallback: { title?: string; subtitle?: string; content?: string }
) {
  const { data, isLoading } = useSectionContent(pageKey, sectionKey);
  
  return {
    title: data?.title || fallback.title || '',
    subtitle: data?.subtitle || fallback.subtitle || '',
    content: data?.content || fallback.content || '',
    isLoading,
    hasDbContent: !!data,
  };
}

export function usePageContent(pageKey: PageKey, sectionKey?: string) {
  const { locale } = useLanguage();
  
  return useQuery({
    queryKey: ['page_content', pageKey, sectionKey, locale],
    queryFn: async () => {
      let query = supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .eq('locale', locale);
      
      if (sectionKey) {
        query = query.eq('section_key', sectionKey);
      }
      
      const { data, error } = await query;
      
      if (error) {
        // If table doesn't exist, return empty
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }
      
      return data as PageContent[];
    },
  });
}

export function useAllPageContent(pageKey: PageKey) {
  return useQuery({
    queryKey: ['page_content', pageKey, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .order('section_key');
      
      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }
      
      return data as PageContent[];
    },
  });
}

export function useUpdatePageContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: Omit<PageContent, 'id' | 'updated_at'> & { id?: string }) => {
      const { id, ...updates } = content;
      
      if (id) {
        // Update existing
        const { data, error } = await supabase
          .from('page_content')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as PageContent;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('page_content')
          .insert(updates)
          .select()
          .single();
        
        if (error) throw error;
        return data as PageContent;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page_content'] });
    },
  });
}

export function useUpsertPageContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: {
      page_key: string;
      section_key: string;
      locale: string;
      title?: string | null;
      subtitle?: string | null;
      content?: string | null;
    }) => {
      // Try to find existing record
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_key', content.page_key)
        .eq('section_key', content.section_key)
        .eq('locale', content.locale)
        .single();
      
      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('page_content')
          .update({
            title: content.title,
            subtitle: content.subtitle,
            content: content.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data as PageContent;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('page_content')
          .insert(content)
          .select()
          .single();
        
        if (error) throw error;
        return data as PageContent;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_content'] });
    },
  });
}
